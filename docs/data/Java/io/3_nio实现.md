# NIO实现

## Buffer（缓冲区）

Buffer是 Java NIO的核心组件之一，NIO的数据读写操作基于Buffer进行。

注：数据必须从通道（Channel）读取到缓冲区中，或者从缓冲区写入到通道中。

缓冲区（Buffer）本质上是一个可以读写数据的内存块，可以理解成是一个容器对象，该对象提供了一组方法，可以更轻松地使用内存块，缓冲区对象内置了一些机制，能够跟踪和记录缓冲区的状态变化情况。

Channel提供从文件、网络读取数据的渠道，但是读取或写入的数据都必须经由Buffer 。

### Buffer的常用类型

- ByteBuffer：用于字节数据的读写。最常用，支持直接缓冲区（MappedByteBuffer）和间接缓冲区（HeapByteBuffer）。
- CharBuffer：用于字符数据的读写。通常用于字符编码/解码操作，如与 Charset 配合使用。
- DoubleBuffer：用于双精度浮点数（double）数据的读写。提供对 double 类型数组的封装，支持相对和绝对读写操作。
- MappedByteBuffer：用于将文件区域映射到内存中的读写。是 ByteBuffer 的子类，通过 FileChannel.map() 创建，支持直接 I/O 操作，适合大文件处理。

### Buffer的常见方法

- allocate(int capacity)：分配一个非直接缓冲区（堆内存）。
- allocateDirect(int capacity)：分配一个直接缓冲区（堆外内存，适合频繁 I/O 操作）。
- wrap(byte[] array)：将现有数组包装为缓冲区（仅适用于ByteBuffer 等基本类型）。
- put(byte b)：相对写入：向缓冲区写入单个字节（position 自动递增）。
- putInt()：放入一个int字节的元素，因为在ByteBuffer中，是一个字节一个字节存储的。这个函数会直接放入出4个字节。
- get()：相对读取：从 position 读取一个字节（position 自动递增）。
- getInt()：获取一个int字节的元素，因为在ByteBuffer中，是一个字节一个字节存储的。这个函数会直接读取出4个字节并转换成为int。
- flip()：切换到读模式：将 limit 设为当前 position，position 重置为 0。
- clear()：清空缓冲区：将 position 设为 0，limit 设为 capacity。
- rewind()：重置读取位置：将 position 设为 0，保留 limit 值。
- remaining()：剩余可操作的元素，也就是求size()。
- mark()：使用mark记录当前的position位置，mark=position 
- reset()：令position回溯，position=mark
- compact()：令数组中的前方具有空位的内容向前移动。比如：在一个队伍中排队，此时你前面的人已经都走了，那么现在需要你和你身后的人们向前移动。

### Buffer的属性

- 容量（Capacity）
  - 定义：buffer最大容量，创建时确定且不可更改。
  - 特性：
    - ByteBuffer.allocate(1024) 创建的缓冲区容量为1024，无法动态扩展。
    - 容量决定了缓冲区的物理大小，所有读写操作均受此限制。

- 限制（Limit）
  - 定义：第一个不可读/写的元素索引，表示有效数据的边界。
  - 模式差异：
    - 写模式：limit = capacity（全部空间可写）。
    - 读模式：limit = 写入时的position（仅能读取已写入数据）。
    - 动态调整：可通过limit(newLimit)修改，但需满足 0 ≤ newLimit ≤ capacity。

- 位置（Position）
  - 定义：下一个读写操作的索引，初始为0，自动递增。
  - 模式切换：
    - 写模式：从0开始，每写入一个元素后position++。
    - 读模式：通过flip()将position重置为0，读取后递增。
    - 边界检查：读写操作若超过limit会抛出异常（如BufferOverflowException）。

- 标记（Mark）
  - 定义：临时备忘位置，通过mark()设置当前position，后续可通过reset()恢复。
  - 初始状态：未调用mark()前值为-1，调用后 0 ≤ mark ≤ position。
  - 典型场景：标记读取起点后跳转，再通过reset()返回标记点继续处理。

## Channel（通道）

Channel（通道） 是 Java NIO的核心组件之一，它表示与I/O设备（如文件、网络套接字等）之间的连接。

Channel是双向的，可以同时支持读和写操作，而流只能单向操作（InputStream 或 OutputStream）。



### Channel 与 Buffer 的关系

- 数据传输方式：

  - 传统 I/O（流）：数据直接在流和程序之间传输（面向流）。

  - NIO（Channel + Buffer）：数据通过缓冲区Buffer在Channel 和程序之间传输（面向缓冲区）。

- 操作流程：
    - 读操作：从Channel读取数据到Buffer。
    - 写操作：从Buffer写入数据到Channel。
- 优势：
    - 减少数据在内存和磁盘之间的复制次数。
    - 支持非阻塞 I/O 和多路复用（通过 Selector），提高并发性能。



### Channel 的类型

- FileChannel：用于文件 I/O 操作（读写文件）。
- SocketChannel：客户端用于 TCP 网络通信（基于流的连接）。
- ServerSocketChannel：服务端用于监听 TCP 连接请求，为每个连接创建 SocketChannel。
- DatagramChannel：用于 UDP 网络通信（基于数据报的无连接通信）。
- Pipe.SourceChannel：Pipe 的可读端，用于从 Pipe 读取数据。
- Pipe.SinkChannel：Pipe 的可写端，用于向 Pipe 写入数据。
- AsynchronousChannel：异步 Channel（如 AsynchronousSocketChannel），支持异步 I/O 操作。



### Channel 的核心方法

- read(ByteBuffer dst)：从Channel读取数据到Buffer。返回值为实际读取的字节数（-1 表示 EOF）。
- write(ByteBuffer src)：从Buffer写入数据到Channel。返回值为实际写入的字节数。
- close()：关闭Channel，释放资源。
- isOpen()：检查Channel是否处于打开状态。
- configureBlocking(boolean block)：设置 Channel 的阻塞模式（true 表示阻塞，false 表示非阻塞）。
- register(Selector sel, int ops)：将 Channel 注册到 Selector，监听指定事件（如 OP_READ）。
- transferTo(long position, long count, WritableByteChannel target)：从当前通道传输到目标通道
- transferFrom(ReadableByteChannel src, long position, long count)：从源通道传输到当前通道




### Channel相关问题

Q：如果说客户端这边正常退出或者非正常退出了，服务端如何处理那？

A：需要在代码里进行以下操作：

- 检测断开：调用 channel.read(buffer)。
  - 如果返回 -1：说明客户端正常断开连接（调用了 close()）。
  - 如果抛出 IOException：说明客户端异常崩溃（直接杀掉了进程）。

- 取消注册：调用 key.cancel()。告诉 Selector：“这个插签我不要了，别再监控它了”。

- 关闭通道：调用 channel.close()。彻底释放操作系统的文件句柄资源。



Q：如果我主动发送-1那，是否会把连接断开？

A：在Java NIO中，channel.read(buffer) 返回的-1不是从网络上读到的数据内容，而是底层操作系统给出的一个状态信号。

- 数据内容：你通过网络发送的任何内容（无论是 0、1、还是二进制的 -1），都会被装进 ByteBuffer 里。
- 返回值：read() 方法的返回值代表的是**“读到了多少个字节”**。
  - 返回 10：代表读到了 10 个字节，存进了 Buffer。
  - 返回 0：代表目前没数据可读（非阻塞模式下常见）。
  - 返回 -1：这是一个特殊的流结束符（EOF, End of File）。
- 除非关闭了Socket通道，否则对方的read()永远不会返回-1。



### Channel 的工作原理

#### 双向性

Channel支持**读**和写操作，例如：

```java
FileChannel channel = new RandomAccessFile("data.txt", "rw").getChannel();
ByteBuffer buffer = ByteBuffer.allocate(1024);

// 读操作：从 Channel 读取数据到 Buffer
int bytesRead = channel.read(buffer);

// 写操作：从 Buffer 写入数据到 Channel
int bytesWritten = channel.write(buffer);
```





#### 非阻塞 I/O

Channel可以配置为非阻塞模式（默认是阻塞模式），结合Selector实现多路复用：

Q: 为什么设置为非阻塞模式，才能实现多路复用？如果是阻塞模式可以吗？

A：**在技术实现上，只有非阻塞模式才能让 Selector 真正发挥作用。**

- **阻塞模式的困境**： 假设你把一个 `SocketChannel` 设为阻塞模式并注册到 `Selector`。当调用 `channel.read(buffer)` 时，如果对方没发数据，**当前线程会死等（挂起）**。 此时，即便 `Selector` 监控的其他 99 个通道都有数据进来了，你的线程也动弹不了。这违背了“一个线程管理多个连接”的初衷。
- **非阻塞模式的优雅**： 在非阻塞模式下，`read()` 操作会**立即返回**。
  - 如果有数据，返回读取的字节数。
  - 如果没数据，返回 0。 由于不会被某一个连接“卡死”，线程就可以轮询 `Selector`，看看哪个通道准备好了就处理哪个。

```java
SocketChannel socketChannel = SocketChannel.open();
socketChannel.configureBlocking(false); // 设置非阻塞模式
```



#### Selector 的配合

Selector 是 NIO 的核心组件之一，用于监听多个 Channel 的事件（如连接、读、写）：

```java
Selector selector = Selector.open();
socketChannel.register(selector, SelectionKey.OP_READ); // 监听读事件
```

   

## Selector（选择器）

Selector（选择器） 是 Java NIO的核心组件之一，用于实现I/O多路复用。它允许一个线程同时监控多个通道（Channel）的I/O事件（如可读、可写、连接、接受连接），从而在事件发生时进行响应。这种机制显著提高了系统的并发性能和资源利用率。



### Selector 的工作原理

Selector 的核心思想是通过事件驱动模型，将I/O操作从线程中解耦，避免为每个连接分配独立线程。其工作流程分为以下三个步骤：

1. 注册（Registration）
   - 将通道（如 SocketChannel、ServerSocketChannel）注册到 Selector 上，并指定感兴趣的 I/O 事件（如OP_READ、OP_WRITE）。
   - 注册后，Selector会维护一个 事件注册表（Registration Table），记录每个通道的事件兴趣集。

2. 选择（Selection）
   - 调用Selector.select()方法，阻塞等待直到至少有一个通道的事件就绪（或超时）。
   - Selector会轮询所有注册的通道，检查是否有事件发生，并将就绪的事件记录到就绪事件集合（Selected Key Set） 中。
3. 事件处理（Event Handling）
   - 遍历就绪事件集合中的SelectionKey，根据事件类型（如 isReadable()、isWritable()）执行对应的处理逻辑。
   - :full_moon:处理完成后，需手动移除已处理的SelectionKey，避免重复处理。



Q：什么是事件驱动模型？

A：

:full_moon:人话理解：

非事件驱动（轮询/死等）：你点完外卖，站在门口一直盯着路口看。外卖员没来，你不能睡觉、不能打游戏、不能洗澡。

事件驱动：你点完外卖，去打游戏或睡觉。当“门铃响了”（事件发生），这个声音触发了你的反应，你才放下手里的活去开门（执行回调逻辑）。



规范术语：

事件源 (Event Source)：产生事件的物体。例如鼠标、键盘、网络网卡、传感器。

事件 (Event)：发生的事情本身（包含数据）。例子如Click事件、Data_Received事件。

事件循环 (Event Loop)：**模型的心脏**。它是一个死循环，不断检查有没有新事件发生。

事件处理器 (Event Handler / Callback)：预先写好的逻辑。例如当“点击”发生时，执行“保存文件”的代码。



### Selector的核心方法

- open()：创建一个新的 Selector 实例。
- register(SelectableChannel ch, int ops)：将通道注册到 Selector，并指定感兴趣的事件（如 OP_READ、OP_WRITE）。
- select()：阻塞直到至少有一个通道的事件就绪。
- select(long timeout)：阻塞最多 timeout 毫秒，或直到事件就绪。
- selectNow()：非阻塞版本，立即返回当前就绪的事件数量。
- selectedKeys()：返回当前就绪事件的 SelectionKey 集合。
- wakeup()：唤醒阻塞在 select() 或 select(timeout) 上的线程。
- close()：关闭 Selector，释放资源。



### SelectionKey 的作用

SelectionKey是Selector与channel通道之间的绑定关系，表示一个通道在Selector上的注册状态。其关键功能包括：

- 事件兴趣集（Interest Set）
  - 指定通道对哪些事件感兴趣（如 OP_READ、OP_WRITE）。可通过 interestOps() 设置或获取。

- 事件就绪集（Ready Set）
  - 表示通道当前已就绪的事件（如 isReadable()、isWritable()）。

- 通道与 Selector 的关联
  - 通过 key.channel() 获取关联的通道，key.selector()获取关联的Selector。



### Selector 的典型使用场景

Selector主要用于需要高并发、低延迟的网络服务场景，例如：

- 网络服务器
  - 单线程管理多个客户端连接，避免线程爆炸问题。
- 聊天室/消息推送系统
  - 实时监控多个客户端的消息到达事件。
- 分布式系统
  - 高效处理大量节点之间的通信。



### Selector 的优势与注意事项

优势：

- 单线程管理多连接：减少线程创建和上下文切换的开销。
- 高并发性能：适合处理大量并发连接（如 10k+ 客户端）。
- 资源节省：避免线程爆炸问题，降低内存占用。

注意事项：

- :full_moon:通道必须是非阻塞的：Selector 只支持 SocketChannel、ServerSocketChannel 等非阻塞通道。

- 事件处理需及时：避免长时间阻塞在 select() 方法上。

- 资源释放：关闭Selector和通道时需调用close()，避免内存泄漏。

- 事件重复处理：需手动移除已处理的 SelectionKey，防止重复触发。

  

## NIO 的工作流程

服务端流程（以TCP为例）

- 创建 ServerSocketChannel 并绑定端口。
- 设置为非阻塞模式。
- 打开Selector，并将ServerSocketChannel注册到 Selector，监听OP_ACCEPT。
- 循环调用selector.select() 等待事件。
- 当OP_ACCEPT事件发生时，接受新连接。
- 将新连接的SocketChannel注册到 Selector，监听OP_READ。
- 当OP_READ事件发生时，读取数据并处理。



客户端流程

- 创建 SocketChannel 并连接到服务端。
- 设置为非阻塞模式。
- 使用 Selector 监听 OP_CONNECT 和 OP_READ 事件。
- 当连接成功后，发送数据或等待服务端响应。



## NIO 的高级特性

- 文件通道（FileChannel）
  - 支持文件的读写和内存映射。
  
  - 示例：使用 FileChannel.map() 将文件映射到内存中，提高 I/O 效率。
  
- 内存映射文件（MappedByteBuffer）
  - 将文件直接映射到内存中，避免频繁的系统调用。
  - 适用于大文件处理（如日志、数据库文件）。

- 管道（Pipe）
  - 用于线程间通信，Pipe.SourceChannel 和 Pipe.SinkChannel 可以在两个线程之间传递数据。



## NIO的缺陷

NIO有一个非常出名的 Bug，甚至可以说，很多开发者转向 Netty 的原因之一，就是为了避开这个在 Java NIO 底层挥之不去的阴影。

这个 Bug 通常被称为 **NIO Epoll 死循环（CPU 100%）Bug**。



现象描述：没活儿干，却忙个不停

在正常情况下，`selector.select()` 是一个阻塞操作。如果没有事件发生（没人连接、没人发消息），线程应该安静地睡在底层内核调用里，不占用 CPU。

**Bug 发生时**： 即便没有任何事件触发，`selector.select()` 也会瞬间返回。因为是死循环（`while(true)`），线程会不停地： `select() -> 返回 0 -> 回到循环头 -> select() -> 返回 0 ...` 这个过程没有任何阻塞，导致该线程疯狂抢占 CPU 资源。你可以想象一个保安，明明大门口没人，他却每秒钟拉一次警报说“没人！”，直到把自己累瘫。



起因：内核的“误报”

这个 Bug 的根源不在 Java 本身，而在 **Linux 内核的 epoll 机制**。

- **底层逻辑**：Java 的 `Selector` 在 Linux 下是基于 `epoll` 实现的。
- **触发点**：在某些特定情况下（例如客户端异常断开连接），底层内核会触发一个错误码。
- **Java 的反应**：Java NIO 的原始实现没有正确处理这个特殊的错误码，导致它认为“有事发生了”，于是让 `select()` 返回。
- **尴尬的结果**：当 Java 去查看具体的 `selectedKeys` 集合时，却发现里面是空的（因为确实没有真正的 IO 事件）。



为什么这个 Bug 这么难修？

Sun/Oracle 官方曾多次尝试修复，但因为这是操作系统层面的反馈信号与 JVM 交互的问题，很难在不破坏兼容性的情况下彻底解决。

在 2026 年的今天，虽然新版本的 JDK 已经在很大程度上缓解了这个问题，但在高并发、网络环境复杂的工业场景中，偶尔还是会冒出来。

