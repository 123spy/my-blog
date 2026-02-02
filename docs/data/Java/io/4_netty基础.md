# Netty基础

## BIO模型

模型特点：

- 采用**阻塞IO模式**获取输入的数据
- 连接与线程为1 : 1关系。

为什么它不行？

- 线程是很贵的。如果 1000 个连接里有 900 个是在挂机不说话，这 900 个线程就只能在那“阻塞”，白白占用内存。
- 当几万、几十万人同时在线时，没有任何一台服务器能开出几十万个线程。



## Reactor模式

针对传统阻塞 I/O 服务模型的 2 个缺点，解决方案：

- I/O复用：不再死等。多个连接共用一个阻塞对象（Selector）。只有当某个连接真的有数据了，系统才会通知应用程序去处理。

- 线程池：活儿来了，分给池子里的空闲线程。干完活，线程立刻归还，去帮下一个连接，实现**“一个线程打多份工”**。



### 单Reactor单线程

服务器端用一个线程通过多路复用搞定所有的IO操作包括连接，读、写等



- 模型简单，没有多线程、进程通信、竞争的问题，全部都在一个线程中完成

- 性能不足，只有一个线程，无法完全发挥多核 `CPU` 的性能。`Handler`在处理某个连接上的业务时，整个进程无法处理其他连接事件，很容易导致性能瓶颈
- 可靠性问题，线程意外终止，或者进入死循环，会导致整个系统通信模块不可用，不能接收和处理外部消息，造成节点故障



### 单Reactor多线程

服务器端用一个线程获取io连接，并将其他的任务交给另外的线程进行。

- 可以充分的利用多核 `cpu` 的处理能力

- 多线程数据共享和访问比较复杂，`Reactor` 处理所有的事件的监听和响应，在单线程运行，在高并发场景容易出现性能瓶颈。



### 主从Reactor多线程

Reactor分为了MainReactor与SubReactor。



MainReactor只负责监听连接事件，收到事件后，将连接分配给SubReactor。

subreactor负责监听读写等其他事件，将连接加入到连接队列进行监听，并创建handler进行各种事件处理。



当有新事件发生时，subreactor就会调用对应的handler处理。handler通过read读取数据，分发给后面的worker线程处理。

worker线程池分配独立的worker线程进行业务处理，并返回结果。handler收到响应的结果后，再通过send将结果返回给client。



Reactor主线程可以对应多个Reactor子线程，即MainRecator可以关联多个SubReactor。



## Netty模型

<img src="./assets/chapter05_10.png" alt="img"  />

Netty 的线程模型是其高性能的核心。它基于 **主从 Reactor 多线程模型** 进行了优化和实现。

### 1. 通俗理解：大型餐厅模型

为了更好地理解 Netty 的复杂的组件，我们可以将其类比为一个**“高效运转的大型餐厅”**：

- **BossGroup（迎宾团队）：** 专门负责在门口接待客人。
  - *职责*：只做一件事——**连接（Accept）**。一旦有客人进门（客户端连接），立刻发一张号码牌（Channel），然后把客人带到座位上，转交给服务员（Worker）。
- **WorkerGroup（服务员团队）：** 负责照顾已经入座的客人。
  - *职责*：负责所有的**业务服务（IO读写）**。比如点菜（Read）、上菜（Write）、结账。每个人（Thread）同时负责几张桌子。
- **NioEventLoop（具体的某个人）：** 就是一个干活的线程，它拥有“分身术”，能在多个桌子间快速切换（多路复用）。
- **Pipeline（后厨流水线）：** 一道菜从下单到上桌的标准化流程（清洗 -> 切菜 -> 烹饪 -> 摆盘），对应数据处理的 **解码 -> 业务逻辑 -> 编码**。

### 2. 核心组件详解

Netty 抽象出两组线程池：**BossGroup**与**WorkerGroup**。它们的类型都是**NioEventLoopGroup**。

#### 2.1 NioEventLoopGroup (线程组)

- **定义**：相当于一个事件循环组，这个组中含有多个事件循环（`NioEventLoop`）。
- **关系**：
  - `BossGroup` 通常只需要**1**个线程（因为监听端口通常只有一个）。
  - `WorkerGroup` 默认线程数是**CPU核心数 \* 2**。

#### 2.2 NioEventLoop (事件循环/线程)

- **定义**：表示一个不断循环执行处理任务的线程。
- **组成**：每个 `NioEventLoop` 内部都有一个**Selector**（多路复用器）和一个 **TaskQueue**（任务队列）。
- **职责**：
  - **Selector**：用于监听绑定在其上的 Socket 网络通道（Channel）的 IO 事件。
  - **TaskQueue**：用于处理非 IO 的系统任务（如用户提交的定时任务、异步回调任务）。

### 3. 工作流程与循环机制

Netty 的运行机制就是 `NioEventLoop` 不断循环执行以下步骤的过程：

#### 3.1 Boss NioEventLoop 的循环步骤

1. **轮询（Select）**：关注 `Accept` 事件（是否有新连接）。
2. **处理（Process）**：处理 `Accept` 事件，与 Client 建立连接，生成 `NioSocketChannel`，并将其**注册**到 `WorkerGroup` 中的某个 `NioEventLoop` 的 Selector 上。
3. **任务（RunAllTasks）**：处理任务队列中的其他任务。

#### 3.2 Worker NioEventLoop 的循环步骤

1. **轮询（Select）**：关注 `Read` 和 `Write` 事件（通过 Selector）。
2. **处理（Process）**：在对应的 `NioSocketChannel` 上处理 IO 事件。此时数据会在 `ChannelPipeline` 中流动，经过各种 Handler 的处理。
3. **任务（RunAllTasks）**：处理任务队列中的任务。

### 4. 核心设计：串行化与无锁化

这是 Netty 高性能的关键点。

- **串行化设计**：`NioEventLoop` 内部采用串行化设计，从消息的 **读取 -> 解码 -> 业务处理 -> 编码 -> 发送**，始终由**同一个** IO 线程 (`NioEventLoop`) 负责。
- **唯一绑定关系**：
  - 每个 `NioChannel` 只会绑定在唯一的 `NioEventLoop` 上。
  - 一个 `NioEventLoop` 可以管理多个 `NioChannel`。
- **优势（Lock-free）**：
  - 因为一个Channel 的所有操作都在一个线程内完成，**天然避免了多线程竞争**。
  - **不需要加锁**，也没有线程上下文切换的开销，极大地提升了 CPU 利用率。

### 5. ChannelPipeline (管道)

每个 `Worker` 处理业务时，会使用 `Pipeline`。

- **结构**：`Pipeline` 是一个双向链表，维护了属于该 Channel 的所有 **处理器（Handler）**。
- **包含关系**：`Channel` 包含 `Pipeline`，`Pipeline` 包含多个 `ChannelHandlerContext`（包装了 Handler）。
- **流向**：
  - **入站（Inbound）**：数据从 Socket 读取出来，从 Pipeline 头部流向尾部（如：解码器 -> 业务Handler）。
  - **出站（Outbound）**：数据写回 Socket，从 Pipeline 尾部流向头部（如：业务Handler -> 编码器）。

### 6. 模型与代码的映射

理论对应到实际代码的结构如下：

```java
// 1. BossGroup (迎宾): 接收连接
EventLoopGroup bossGroup = new NioEventLoopGroup(1);
// 2. WorkerGroup (服务员): 处理读写
EventLoopGroup workerGroup = new NioEventLoopGroup();

try {
    ServerBootstrap bootstrap = new ServerBootstrap();
    bootstrap.group(bossGroup, workerGroup) // 绑定两个线程组
             .channel(NioServerSocketChannel.class) // 指定服务端通道实现
             .childHandler(new ChannelInitializer<SocketChannel>() {
                 @Override
                 protected void initChannel(SocketChannel ch) {
                     // 3. 配置 Pipeline (流水线)
                     // 这里的 Handler 就是 Worker 线程处理 IO 事件时调用的逻辑
                     ch.pipeline().addLast(new MyDecoder()); // 入站
                     ch.pipeline().addLast(new MyBusinessHandler()); // 业务
                     ch.pipeline().addLast(new MyEncoder()); // 出站
                 }
             });
    // ... 绑定端口启动
} finally {
    bossGroup.shutdownGracefully();
    workerGroup.shutdownGracefully();
}
```



## 异步模型

### 1. 基本概念

- **异步 vs 同步**：
  - 同步：调用方发起调用后，必须**死等**结果返回，才能继续执行后续代码。
  - 异步：调用方发起调用后，**立刻返回**，不等待结果。实际处理任务的组件在完成后，通过状态、通知或回调（Callback）来告知调用方。
- **Netty 的做法**：
  - Netty 中的 I/O 操作（如 `bind`、`write`、`connect`）全是异步的。
  - 这些操作会立刻返回一个 `ChannelFuture` 对象，而不会阻塞当前线程。

### 2. Future-Listener 机制

Netty 的异步模型建立在 **Future** 和 **Callback** 之上。

- **核心思想**： 假设有一个耗时的方法 `fun()`，为了不阻塞程序，Netty 在调用 `fun()` 时，会立刻返回一个凭证 —— **Future**。后续我们可以通过这个 Future 去监控 `fun()` 的处理过程，或者注册一个监听器（Listener），等 `fun()` 结束后自动触发监听器中的代码。
- **ChannelFuture**：
  - `public interface ChannelFuture extends Future<Void>`
  - 这是 Netty 专门为 I/O 操作定义的接口，表示“异步 I/O 操作的结果”。

### 3. ChannelFuture 的状态与操作

当 `ChannelFuture` 刚刚创建时，处于**非完成状态**。随着操作进行，我们可以通过以下方法交互：

- **状态判断**：
  - `isDone()`：操作是否完成（无论是成功、失败还是取消，只要结束了都算完成）。
  - `isSuccess()`：操作是否**成功**。
  - `isCancelled()`：操作是否被取消。
  - `cause()`：获取操作失败的原因（如果有异常）。
- **注册监听（推荐）**：
  - `addListener(GenericFutureListener)`：注册一个监听器。当操作完成（`isDone` 为 true）时，系统会自动触发监听器中的 `operationComplete` 方法。

### 4. Sync() 同步等待

虽然 Netty 提倡异步（使用 Listener），但在某些特定场景下（主要是程序启动和关闭时），我们需要**将异步变为同步**，这就用到了 `sync()` 方法。

`sync()` 的作用是：**阻塞当前线程，直到操作完成**。如果操作失败，它会抛出异常。



为什么启动代码中全是 sync()？

在 `main` 方法中，我们通常会看到这样的代码：

Java

```
// 1. bind 操作是异步的，返回 ChannelFuture
ChannelFuture cf = bootstrap.bind(6668).sync(); 

// 2. closeFuture 操作也是异步的
cf.channel().closeFuture().sync();
```

- **`bind().sync()`**：
  - **目的**：确保服务真正启动成功后，才继续向下执行。
  - **逻辑**：如果不用 `sync()`，可能主线程跑完了，端口还没绑定好，后续逻辑就会出错。
- **`closeFuture().sync()`**：
  - **目的**：防止主线程（Main Thread）执行完代码后直接退出。
  - **逻辑**：它相当于在说“主线程你就在这儿死等，直到服务器通道被关闭（Close）了，你才能结束”。这保证了服务器能一直运行。



⚠️ 重要警告：千万别在 Handler 中用 sync()

`sync()` **只能**在主线程（Main Thread）或非 Netty 线程中使用。

**严禁**在 Netty 的 I/O 线程（如 `NioEventLoop`）中调用 `sync()`，否则会导致**死锁**。

- **原因**：`NioEventLoop` 既是负责“干活”的线程，又是你调用 `sync()` 等待结果的线程。
- **后果**：自己等自己，永远等不到结果，整个线程卡死，服务器失去响应。

> **正确姿势**：在 Handler（业务逻辑）中，永远使用 `addListener` 机制，或者直接处理，不要去阻塞线程。



### 5. 异步实战代码示例

相比于使用 `Future.get()` 进行阻塞等待，Netty 更推荐使用 **Listener**。

Java

```
// 举例：异步绑定端口
ChannelFuture cf = serverBootstrap.bind(6668);

// 注册监听器，监控绑定结果
cf.addListener(new ChannelFutureListener() {
    @Override
    public void operationComplete(ChannelFuture future) throws Exception {
        if (future.isSuccess()) {
            System.out.println("端口 6668 绑定成功");
        } else {
            System.out.println("端口 6668 绑定失败");
            // 获取失败原因
            future.cause().printStackTrace();
        }
    }
});
```

> **总结**：Netty 的目标是将业务逻辑与底层网络操作解耦。你只需要通过 Future 或 Callback 告诉 Netty：“等你干完这事儿，帮我执行这段代码”，从而实现高效的非阻塞编程。
