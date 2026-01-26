# NIO实现

## Buffer（缓冲区）

### Buffer的概念

Buffer（缓冲区）是 Java NIO（Non-blocking I/O）的核心组件之一，NIO的数据读写操作基于缓冲区（Buffer）进行。数据必须从通道（Channel）读取到缓冲区中，或者从缓冲区写入到通道中。

缓冲区（Buffer）本质上是一个可以读写数据的内存块，可以理解成是一个容器对象（含数组），该对象提供了一组方法，可以更轻松地使用内存块，缓冲区对象内置了一些机制，能够跟踪和记录缓冲区的状态变化情况。Channel提供从文件、网络读取数据的渠道，但是读取或写入的数据都必须经由Buffer 。

### Buffer的类型

- ByteBuffer：用于字节数据的读写。最常用，支持直接缓冲区（MappedByteBuffer）和间接缓冲区（HeapByteBuffer）。
- CharBuffer：用于字符数据的读写。通常用于字符编码/解码操作，如与 Charset 配合使用。
- DoubleBuffer：用于双精度浮点数（double）数据的读写。提供对 double 类型数组的封装，支持相对和绝对读写操作。
- FloatBuffer：用于单精度浮点数（float）数据的读写。类似 DoubleBuffer，但处理 float 类型数据。
- IntBuffer：用于整数（int）数据的读写。提供对 int 类型数组的封装，支持批量操作和位置、限制等属性管理。
- LongBuffer：用于长整数（long）数据的读写。处理 long 类型数据，适用于需要高精度整数存储的场景。
- ShortBuffer：用于短整数（short）数据的读写。适用于节省内存的场景，如处理音频、图像等二进制数据。
- MappedByteBuffer：用于将文件区域映射到内存中的读写。是 ByteBuffer 的子类，通过 FileChannel.map() 创建，支持直接 I/O 操作，适合大文件处理。

### Buffer的常见方法

- **allocate(int capacity)	分配一个非直接缓冲区（堆内存）。**
- **allocateDirect(int capacity)	分配一个直接缓冲区（堆外内存，适合频繁 I/O 操作）。**
- wrap(byte[] array)	将现有数组包装为缓冲区（仅适用于ByteBuffer 等基本类型）。
- **put(byte b)	相对写入：向缓冲区写入单个字节（position 自动递增）。**
- put(byte[] src)	批量写入：将字节数组复制到缓冲区（从 position 开始）。
- put(int index, byte b)	绝对写入：在指定 index 位置写入字节（不改变 position）。
- put(ByteBuffer src)	将另一个缓冲区的数据复制到当前缓冲区。
- **get()	相对读取：从 position 读取一个字节（position 自动递增）。**
- get(byte[] dst)	批量读取：将数据读取到字节数组（从 position 开始）。
- get(int index)	绝对读取：从指定 index 位置读取一个字节（不改变 position）。
- get(ByteBuffer dst)	将数据读取到另一个缓冲区。
- **flip()**	切换到读模式：将 limit 设为当前 position，position 重置为 0。
- **clear()**	清空缓冲区：将 position 设为 0，limit 设为 capacity。
- **rewind()**	重置读取位置：将 position 设为 0，保留 limit 值。
- mark()	标记当前 position 位置。
- reset()	将 position 恢复到之前 mark() 的位置。
- remaining()	返回 limit - position，即剩余可操作的数据量。
- hasRemaining()	判断是否还有剩余数据（position < limit）。
- slice()	创建一个新的缓冲区，共享原缓冲区的数据（limit 和 position 为原值）。
- duplicate()	创建一个与原缓冲区共享数据的副本（position、limit、capacity 相同）。
- asReadOnlyBuffer()	创建一个只读缓冲区。
- compareTo(Buffer that)	比较两个缓冲区的内容（按字典序）。
- equals(Object ob)	判断两个缓冲区是否相等（内容、position、limit 等完全一致）。
- isDirect()	判断是否为直接缓冲区。
- isReadOnly()	判断是否为只读缓冲区。
- asCharBuffer()	将 ByteBuffer 转换为 CharBuffer。
- asIntBuffer()	将 ByteBuffer 转换为 IntBuffer。
- getChar() / putChar(char value)	处理字符数据（CharBuffer 特有）。

### Buffer的属性

#### 容量（Capacity）

定义：缓冲区能够容纳的最大元素数量，创建时确定且不可更改。
特性：
例如，ByteBuffer.allocate(1024) 创建的缓冲区容量为1024，无法动态扩展。
容量决定了缓冲区的物理大小，所有读写操作均受此限制。

#### 4.2 限制（Limit）

定义：第一个不可读/写的元素索引，表示有效数据的边界。
模式差异：
写模式：limit = capacity（全部空间可写）。
读模式：limit = 写入时的position（仅能读取已写入数据）。
动态调整：可通过limit(newLimit)修改，但需满足 0 ≤ newLimit ≤ capacity。

#### 4.3 位置（Position）

定义：下一个读写操作的索引，初始为0，自动递增。
模式切换：
写模式：从0开始，每写入一个元素后 position++。
读模式：通过flip()将position重置为0，读取后递增。
边界检查：读写操作若超过limit会抛出异常（如BufferOverflowException）。

#### 4.4 标记（Mark）

定义：临时备忘位置，通过mark()设置当前position，后续可通过reset()恢复。
初始状态：未调用mark()前值为-1，调用后 0 ≤ mark ≤ position。
典型场景：标记读取起点后跳转，再通过reset()返回标记点继续处理。

### Buffer状态操作

假设创建一个容量为10的ByteBuffer：

写入数据：position从0递增至5（写入5个元素）。
切换读模式：调用flip()，limit=5，position=0。
读取数据：从position=0读取到position=5。
重置位置：若需重读，调用rewind()，position=0。
清空缓冲区：调用clear()，准备重新写入。

## Channel（通道）

### Channel 的基本概念

Channel（通道） 是 Java NIO（Non-blocking I/O）的核心组件之一，它表示与 I/O 设备（如文件、网络套接字等）之间的连接。与传统的 Java I/O 流不同，Channel 是 双向的，可以同时支持读和写操作，而流只能单向操作（InputStream 或 OutputStream）。

### Channel 与 Buffer 的关系

- 数据传输方式：

  - 传统 I/O（流）：数据直接在流和程序之间传输（面向流）。

  - NIO（Channel + Buffer）：数据通过缓冲区（Buffer） 在 Channel 和程序之间传输（面向缓冲区）。

- 操作流程：
    - 读操作：从 Channel 读取数据到 Buffer。
    - 写操作：从 Buffer 写入数据到 Channel。
- 优势：
    - 减少数据在内存和磁盘之间的复制次数。
    - 支持非阻塞 I/O 和多路复用（通过 Selector），提高并发性能。


### Channel 的类型

- FileChannel	用于文件 I/O 操作（读写文件）。
- SocketChannel	客户端用于 TCP 网络通信（基于流的连接）。
- ServerSocketChannel	服务端用于监听 TCP 连接请求，为每个连接创建 SocketChannel。
- DatagramChannel	用于 UDP 网络通信（基于数据报的无连接通信）。
- Pipe.SourceChannel	Pipe 的可读端，用于从 Pipe 读取数据。
- Pipe.SinkChannel	Pipe 的可写端，用于向 Pipe 写入数据。
- AsynchronousChannel	异步 Channel（如 AsynchronousSocketChannel），支持异步 I/O 操作。

### Channel 的工作原理

#### 双向性

Channel 支持 读 和 写 操作，例如：

```java
FileChannel channel = new RandomAccessFile("data.txt", "rw").getChannel();
ByteBuffer buffer = ByteBuffer.allocate(1024);

// 读操作：从 Channel 读取数据到 Buffer
int bytesRead = channel.read(buffer);

// 写操作：从 Buffer 写入数据到 Channel
int bytesWritten = channel.write(buffer);
```



#### 非阻塞 I/O

Channel 可以配置为非阻塞模式（默认是阻塞模式），结合Selector实现多路复用：

Q: 为什么设置为非阻塞模式，才能实现多路复用？如果是阻塞模式可以吗？

A：**在技术实现上，只有非阻塞模式才能让 Selector 真正发挥作用。**

- **阻塞模式的困境**： 假设你把一个 `SocketChannel` 设为阻塞模式并注册到 `Selector`。当调用 `channel.read(buffer)` 时，如果对方没发数据，**当前线程会死等（挂起）**。 此时，即便 `Selector` 监控的其他 99 个通道都有数据进来了，你的线程也动弹不了。这违背了“一个线程管理多个连接”的初衷。
- **非阻塞模式的优雅**： 在非阻塞模式下，`read()` 操作会**立即返回**。
  - 如果有数据，返回读取的字节数。
  - 如果没数据，返回 0。 由于不会被某一个连接“卡死”，线程就可以轮询 `Selector`，看看哪个通道准备好了就处理哪个。

**结论**：`Selector` 像是一个巡逻员。如果通道是阻塞的，巡逻员去敲第一家门没回应就会在那儿等到天黑；如果是非阻塞的，没人开门他会立刻去敲第二家。

```java
SocketChannel socketChannel = SocketChannel.open();
socketChannel.configureBlocking(false); // 设置非阻塞模式
```



#### 与 Selector 的配合

Selector 是 NIO 的核心组件之一，用于监听多个 Channel 的事件（如连接、读、写）：

```java
Selector selector = Selector.open();
socketChannel.register(selector, SelectionKey.OP_READ); // 监听读事件
```



#### Channel 的核心方法

- read(ByteBuffer dst)	从 Channel 读取数据到 Buffer。返回值为实际读取的字节数（-1 表示 EOF）。
- write(ByteBuffer src)	从 Buffer 写入数据到 Channel。返回值为实际写入的字节数。
- close()	关闭 Channel，释放资源。
- isOpen()	检查 Channel 是否处于打开状态。
- configureBlocking(boolean block)	设置 Channel 的阻塞模式（true 表示阻塞，false 表示非阻塞）。
- register(Selector sel, int ops)	将 Channel 注册到 Selector，监听指定事件（如 OP_READ）。



#### Channel 的典型使用场景

##### 文件 I/O（FileChannel）

读取文件：

```java
try (FileChannel channel = new RandomAccessFile("data.txt", "r").getChannel()) {
    ByteBuffer buffer = ByteBuffer.allocate(1024);
    int bytesRead;
    while ((bytesRead = channel.read(buffer)) != -1) {
        buffer.flip(); // 切换到读模式
        while (buffer.hasRemaining()) {
            System.out.print((char) buffer.get());
        }
        buffer.clear(); // 清空缓冲区
    }
} catch (IOException e) {
    e.printStackTrace();
}
```


写入文件：

```java
try (FileChannel channel = new RandomAccessFile("data.txt", "rw").getChannel()) {
    ByteBuffer buffer = ByteBuffer.wrap("Hello NIO!".getBytes());
    channel.write(buffer);
} catch (IOException e) {
    e.printStackTrace();
}
```



##### 网络通信（SocketChannel + ServerSocketChannel）

服务端：

```java
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.configureBlocking(false);

Selector selector = Selector.open();
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select(); // 阻塞等待事件
    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    for (SelectionKey key : selectedKeys) {
        if (key.isAcceptable()) {
            SocketChannel clientChannel = serverChannel.accept();
            clientChannel.configureBlocking(false);
            clientChannel.register(selector, SelectionKey.OP_READ);
        } else if (key.isReadable()) {
            SocketChannel clientChannel = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            clientChannel.read(buffer);
            System.out.println("Received: " + new String(buffer.array()).trim());
        }
    }
    selectedKeys.clear();
}
```


客户端：

```java
SocketChannel clientChannel = SocketChannel.open();
clientChannel.configureBlocking(false);
clientChannel.connect(new InetSocketAddress("localhost", 8080));

while (!clientChannel.finishConnect()) {
    // 等待连接完成
}

ByteBuffer buffer = ByteBuffer.wrap("Hello Server!".getBytes());
clientChannel.write(buffer);
```



##### UDP 通信（DatagramChannel）

发送数据报：

```java
DatagramChannel channel = DatagramChannel.open();
channel.configureBlocking(false);
ByteBuffer buffer = ByteBuffer.wrap("UDP Message".getBytes());
channel.send(buffer, new InetSocketAddress("localhost", 9090));
```


接收数据报：

```java
ByteBuffer buffer = ByteBuffer.allocate(1024);
InetSocketAddress clientAddress = (InetSocketAddress) channel.receive(buffer);
System.out.println("Received from " + clientAddress + ": " + new String(buffer.array()).trim());
```



#### Channel 的特点与优势

- 高效性：
  - 通过 Buffer 和 Channel 的协作，减少数据在内存和磁盘之间的复制次数。
  - 非阻塞模式结合 Selector，可实现单线程处理多个 I/O 操作，提升并发性能。

- 灵活性：
  - 支持文件 I/O、TCP/UDP 网络通信、管道通信等多种场景。
  - 可灵活配置阻塞/非阻塞模式。
- 跨平台性：
  - Channel 的设计与底层操作系统 I/O 机制解耦，兼容性较好。



## Selector（选择器）



### Selector 的基本概念

Selector（选择器） 是 Java NIO（Non-blocking I/O）的核心组件之一，用于实现 I/O 多路复用（I/O Multiplexing）。它允许一个线程同时监控多个通道（Channel）的 I/O 事件（如可读、可写、连接、接受连接），从而在事件发生时进行响应。这种机制显著提高了系统的并发性能和资源利用率。



### Selector 的工作原理

Selector 的核心思想是通过 事件驱动 模型，将 I/O 操作从线程中解耦，避免为每个连接分配独立线程。其工作流程分为以下三个步骤：

1. 注册（Registration）
   - 将通道（如 SocketChannel、ServerSocketChannel）注册到 Selector 上，并指定感兴趣的 I/O 事件（如 OP_READ、OP_WRITE）。
   - 注册后，Selector 会维护一个 事件注册表（Registration Table），记录每个通道的事件兴趣集。

2. 选择（Selection）
   - 调用 Selector.select() 方法，阻塞等待直到至少有一个通道的事件就绪（或超时）。
   - Selector 会轮询所有注册的通道，检查是否有事件发生，并将就绪的事件记录到 就绪事件集合（Selected Key Set） 中。
3. 事件处理（Event Handling）
   - 遍历就绪事件集合中的 SelectionKey，根据事件类型（如 isReadable()、isWritable()）执行对应的处理逻辑。
   - 处理完成后，需手动移除已处理的 SelectionKey，避免重复处理。



### Selector 的核心方法

- open()	创建一个新的 Selector 实例。
- register(SelectableChannel ch, int ops)	将通道注册到 Selector，并指定感兴趣的事件（如 OP_READ、OP_WRITE）。
- select()	阻塞直到至少有一个通道的事件就绪。
- select(long timeout)	阻塞最多 timeout 毫秒，或直到事件就绪。
- selectNow()	非阻塞版本，立即返回当前就绪的事件数量。
- selectedKeys()	返回当前就绪事件的 SelectionKey 集合。
- wakeup()	唤醒阻塞在 select() 或 select(timeout) 上的线程。
- close()	关闭 Selector，释放资源。

### SelectionKey 的作用

SelectionKey 是 Selector 与通道之间的绑定关系，表示一个通道在 Selector 上的注册状态。其关键功能包括：

事件兴趣集（Interest Set）
指定通道对哪些事件感兴趣（如 OP_READ、OP_WRITE）。可通过 interestOps() 设置或获取。

事件就绪集（Ready Set）
表示通道当前已就绪的事件（如 isReadable()、isWritable()）。

通道与 Selector 的关联
通过 key.channel() 获取关联的通道，key.selector() 获取关联的 Selector。



### Selector 的典型使用场景

Selector 主要用于需要 高并发、低延迟 的网络服务场景，例如：

- 网络服务器
  - 单线程管理多个客户端连接，避免线程爆炸问题。
- 聊天室/消息推送系统
  - 实时监控多个客户端的消息到达事件。
- 分布式系统
  - 高效处理大量节点之间的通信。



### 代码示例：基于 Selector 的简单服务器

以下是一个使用 Selector 的 TCP 服务器示例：

```java
// 1. 创建 Selector
Selector selector = Selector.open();

// 2. 打开 ServerSocketChannel 并注册到 Selector
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false); // 必须设置为非阻塞模式
serverChannel.bind(new InetSocketAddress(8080));
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

// 3. 事件循环
while (true) {
    // 4. 等待事件就绪
    int readyChannels = selector.select();
    if (readyChannels == 0) continue;

    // 5. 获取就绪事件集合
    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    Iterator<SelectionKey> iterator = selectedKeys.iterator();

    while (iterator.hasNext()) {
        SelectionKey key = iterator.next();

        // 6. 处理 Accept 事件（新连接）
        if (key.isAcceptable()) {
            ServerSocketChannel server = (ServerSocketChannel) key.channel();
            SocketChannel client = server.accept(); // 接受新连接
            client.configureBlocking(false);
            client.register(selector, SelectionKey.OP_READ); // 注册读事件
        }

        // 7. 处理 Read 事件（数据到达）
        if (key.isReadable()) {
            SocketChannel client = (SocketChannel) key.channel();
            ByteBuffer buffer = ByteBuffer.allocate(1024);
            int bytesRead = client.read(buffer);
            if (bytesRead > 0) {
                buffer.flip();
                byte[] data = new byte[buffer.remaining()];
                buffer.get(data);
                System.out.println("Received: " + new String(data));
            }
        }

        // 8. 移除已处理的事件
        iterator.remove();
    }
}
```



### Selector 的优势与注意事项

优势：

- 单线程管理多连接：减少线程创建和上下文切换的开销。
- 高并发性能：适合处理大量并发连接（如 10k+ 客户端）。
- 资源节省：避免线程爆炸问题，降低内存占用。

注意事项：

- 通道必须是非阻塞的：Selector 只支持 SocketChannel、ServerSocketChannel 等非阻塞通道。

- 事件处理需及时：避免长时间阻塞在 select() 方法上。

- 资源释放：关闭 Selector 和通道时需调用 close()，避免内存泄漏。

- 事件重复处理：需手动移除已处理的 SelectionKey，防止重复触发。

  

## NIO 的工作流程

服务端流程（以 TCP 为例）

- 创建 ServerSocketChannel 并绑定端口。
- 设置为非阻塞模式。
- 打开 Selector，并将 ServerSocketChannel 注册到 Selector，监听 OP_ACCEPT。
- 循环调用 selector.select() 等待事件。
- 当 OP_ACCEPT 事件发生时，接受新连接。
- 将新连接的 SocketChannel 注册到 Selector，监听 OP_READ。
- 当 OP_READ 事件发生时，读取数据并处理。



客户端流程

- 创建 SocketChannel 并连接到服务端。
- 设置为非阻塞模式。
- 使用 Selector 监听 OP_CONNECT 和 OP_READ 事件。
- 当连接成功后，发送数据或等待服务端响应。



## NIO 完整代码示例

### NIO服务端代码（NIOServer.java）

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.*;
import java.util.Iterator;
import java.util.Set;

public class NIOServer {
    public static void main(String[] args) throws IOException {
        // 1. 创建 Selector 和 ServerSocketChannel
        Selector selector = Selector.open();
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.configureBlocking(false); // 设置为非阻塞模式

        // 2. 绑定端口并注册到 Selector，监听 OP_ACCEPT 事件
        serverChannel.bind(new InetSocketAddress(8080));
        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        System.out.println("NIO Server started on port 8080");

        // 3. 轮询处理事件
        while (true) {
            int readyChannels = selector.select(); // 阻塞直到有事件发生
            if (readyChannels == 0) continue;

            Set<SelectionKey> selectedKeys = selector.selectedKeys();
            Iterator<SelectionKey> keyIterator = selectedKeys.iterator();

            while (keyIterator.hasNext()) {
                SelectionKey key = keyIterator.next();
                keyIterator.remove();

                if (key.isAcceptable()) {
                    // 处理新连接
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    SocketChannel clientChannel = server.accept();
                    clientChannel.configureBlocking(false);
                    clientChannel.register(selector, SelectionKey.OP_READ);
                    System.out.println("Client connected: " + clientChannel.getRemoteAddress());
                }

                if (key.isReadable()) {
                    // 处理读事件
                    SocketChannel clientChannel = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(1024);
                    int bytesRead = 0;

                    try {
                        bytesRead = clientChannel.read(buffer);
                    } catch (IOException e) {
                        e.printStackTrace();
                        clientChannel.close();
                        continue;
                    }

                    if (bytesRead == -1) {
                        // 客户端关闭连接
                        clientChannel.close();
                        continue;
                    }

                    buffer.flip();
                    byte[] data = new byte[buffer.limit()];
                    buffer.get(data);
                    String message = new String(data).trim();
                    System.out.println("Received from client: " + message);

                    // 响应客户端
                    String response = "Server received: " + message;
                    ByteBuffer outBuffer = ByteBuffer.wrap(response.getBytes());
                    clientChannel.write(outBuffer);
                }
            }
        }
    }
}
```
### NIO客户端代码（NIOClient.java）

```java
import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SocketChannel;

public class NIOClient {
    public static void main(String[] args) {
        try {
            // 1. 创建 SocketChannel 并连接服务器
            SocketChannel socketChannel = SocketChannel.open();
            socketChannel.configureBlocking(false); // 非阻塞模式
            socketChannel.connect(new InetSocketAddress("localhost", 8080));

            // 2. 等待连接完成
            while (!socketChannel.finishConnect()) {
                Thread.sleep(100); // 简单等待
            }

            // 3. 发送消息
            String message = "Hello from NIO Client!";
            ByteBuffer buffer = ByteBuffer.wrap(message.getBytes());
            socketChannel.write(buffer);

            // 4. 接收响应
            buffer.clear();
            int bytesRead = socketChannel.read(buffer);
            if (bytesRead > 0) {
                buffer.flip();
                byte[] data = new byte[buffer.remaining()];
                buffer.get(data);
                System.out.println("Server response: " + new String(data));
            }

            // 5. 关闭连接
            socketChannel.close();

        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

七、NIO 与 BIO/AIO 的区别
特性	BIO（同步阻塞 I/O）	NIO（同步非阻塞 I/O）	AIO（异步非阻塞 I/O）
I/O 模型	同步阻塞	同步非阻塞	异步非阻塞
线程模型	一个连接一个线程	一个线程管理多个连接（多路复用）	操作系统异步完成，无需线程阻塞
资源消耗	高（线程数 = 连接数）	中（单线程管理多个连接）	低（操作系统异步处理）
性能瓶颈	线程数爆炸式增长	轮询开销	依赖操作系统支持
适用场景	低并发、小型应用	中高并发、轻量操作	高并发、重操作（如文件传输）
八、NIO 的优劣势与适用场景
优势：

高并发性能：一个线程可以处理多个连接。
低资源消耗：不需要为每个连接创建线程。
可扩展性强：适合构建高性能网络服务器（如 Netty、Undertow）。
灵活的数据处理：通过 Buffer 可以更精细地控制数据。
劣势：

编程复杂度较高：需要手动管理缓冲区、Selector 和事件处理。
依赖操作系统支持：某些平台对非阻塞 I/O 的实现可能不同（如 Windows vs Linux）。
调试困难：由于异步和非阻塞特性，错误排查可能较复杂。
适用场景：

高并发 TCP/UDP 服务器（如聊天室、游戏服务器）。
高性能 Web 服务器。
大文件传输服务（结合 FileChannel 和 MappedByteBuffer）。
分布式系统通信（如 RPC、消息队列）。
九、NIO 的高级特性

1. 文件通道（FileChannel）
支持文件的读写和内存映射。
示例：使用 FileChannel.map() 将文件映射到内存中，提高 I/O 效率。
2. 内存映射文件（MappedByteBuffer）
将文件直接映射到内存中，避免频繁的系统调用。
适用于大文件处理（如日志、数据库文件）。
3. 管道（Pipe）
用于线程间通信，Pipe.SourceChannel 和 Pipe.SinkChannel 可以在两个线程之间传递数据。
十、总结
Java NIO 是一种高性能、可扩展的 I/O 模型，特别适合处理高并发网络应用。相比传统的 BIO，NIO 通过非阻塞 I/O 和多路复用机制，显著提高了资源利用率和吞吐量。虽然 NIO 的编程复杂度较高，但它在构建高性能服务器（如 Web 服务器、游戏服务器）中扮演着重要角色。
————————————————
版权声明：本文为CSDN博主「五老新」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。
原文链接：https://blog.csdn.net/shuiziliu518/article/details/148700995
