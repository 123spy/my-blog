# Netty 核心模块组件详解 (实战完整版)

Netty 的庞大生态由几个核心组件支撑。理解这些组件的作用，以及**数据如何在它们之间转化**，是掌握 Netty 的关键。

## 1. Bootstrap & ServerBootstrap (启动引导类)

`Bootstrap` 意思是引导，主要作用是配置整个 Netty 程序，串联各个组件。

- **Bootstrap**：客户端启动引导类。
- **ServerBootstrap**：服务端启动引导类。

**常见 API 方法：**

| **方法名**               | **描述**                                                  |
| ------------------------ | --------------------------------------------------------- |
| `group(parent, child)`   | **服务端**设置两个线程组：Boss（接客）和 Worker（干活）。 |
| `channel(class)`         | 设置通道实现类（如 `NioServerSocketChannel.class`）。     |
| `option` / `childOption` | 设置 TCP 参数（如 `SO_KEEPALIVE`）。                      |
| `childHandler`           | 设置业务处理流水线（通常使用 `ChannelInitializer`）。     |
| `bind(port)`             | **服务端**启动端口。                                      |
| `connect(host, port)`    | **客户端**连接服务器。                                    |

------

## 2. Future & ChannelFuture (异步结果)

Netty 中所有的 I/O 操作（Bind, Write, Connect）都是**异步**的。调用后立刻返回一个 `ChannelFuture` 凭证。

- **`sync()` (同步等待)**：
  - *作用*：死等操作完成。
  - *场景*：启动服务 (`bind`) 或关闭服务 (`closeFuture`) 时使用。
- **`addListener()` (异步回调)**：
  - *作用*：注册监听器，操作完成后自动回调。
  - *场景*：业务处理中推荐使用，不阻塞线程。

------

## 3. Channel (网络通道)

Java NIO `SocketChannel` 的封装，代表一个网络连接。

- **`NioSocketChannel`**：TCP 客户端通道。
- **`NioServerSocketChannel`**：TCP 服务端通道。
- **`NioDatagramChannel`**：UDP 通道。

------

## 4. Selector (多路复用器)

Netty 基于 NIO Selector 实现。一个 `EventLoop` 线程持有一个 `Selector`，可以同时监听成千上万个连接的事件。

------

## 5. ChannelHandler (处理器) —— **实战重点**

这是开发者写业务代码的地方。

### 5.1 为什么会有泛型 `<T>`？

我们在写 Handler 时经常看到 `SimpleChannelInboundHandler<String>` 或 `SimpleChannelInboundHandler<User>`。

- 这个 `<T>` 代表**你在这个 Handler 里想收到的数据类型**。
- **关键点**：数据到底是不是 `String` 或 `User`，取决于**Pipeline 前面有没有配置相应的解码器（Codec）**。如果没有配置，你就只能收到 `ByteBuf`。

### 5.2 两个核心实现类对比

| **特性**     | **ChannelInboundHandlerAdapter**                      | **SimpleChannelInboundHandler&lt;T&gt;** |
| ------------ | ----------------------------------------------------- | ---------------------------------------- |
| **场景**     | **中间环节** (如：自定义解码器、拦截器)               | **业务终点** (如：聊天逻辑、数据存储)    |
| **内存管理** | **手动** (必须手动 `ReferenceCountUtil.release(msg)`) | **自动** (Netty 自动帮你释放)            |
| **类型转换** | 拿到的是 Object，需手动强转                           | 自动匹配泛型 `<T>`，无需强转             |

------

## 6. Pipeline & ChannelPipeline (处理流水线)

`ChannelPipeline` 是一个 Handler 的双向链表，实现了**责任链模式**。

**数据流向图解：**

- **入站 (Inbound)**:  Socket -> Decoder(解码) -> BusinessHandler(业务)
- **出站 (Outbound)**: BusinessHandler(业务) -> Encoder(编码) -> Socket



## 7. ChannelHandlerContext (上下文)

Handler 和 Pipeline 之间的桥梁。

- ctx.channel(): 获取通道。
- `ctx.writeAndFlush(msg)`: 写数据（从当前位置流向 Pipeline 头部）。
- `ctx.fireChannelRead(msg)`: 把数据传给下一个 Handler。



## 8. ChannelOption (参数配置)

- `SO_BACKLOG`: 服务器连接队列大小（并发高时调大）。
- `SO_KEEPALIVE`: 保持长连接（心跳）。
- `TCP_NODELAY`: 禁用 Nagle 算法（有数据立刻发，不等待，适合实时系统）。

------

## 9. EventLoopGroup (线程组)

- **BossGroup**: 只负责 Accept 连接（通常 1 个线程）。
- **WorkerGroup**: 负责 Read/Write 和业务计算（默认 CPU 核数 * 2）。

------

## 10. ByteBuf (数据容器)

Netty 的数据载体，替代 Java NIO ByteBuffer。

**核心优势：**

1. **读写分离**：双指针（readerIndex, writerIndex），**不需要 `flip()`**。
2. **自动扩容**：像 ArrayList 一样自动变大。
3. **引用计数**：通过 `retain()` 和 `release()` 管理内存。

------

## 11. Codec 机制 (编解码器) —— **数据如何变成对象？**

在实战中，我们很少直接操作 `ByteBuf`，而是通过 **Codec** 将其转换为 Java 对象。

### 11.1 什么是 Codec？

Codec = Decoder (解码器) + Encoder (编码器)。它是特殊的 `ChannelHandler`。

- **Decoder (入站)**: ByteBuf -> String / Java Object
- **Encoder (出站)**: String / Java Object -> ByteBuf

### 11.2 常见方案

1. **String 传输** (你现在的方案):

   - 配置: `pipeline.addLast(new StringDecoder())`
   - 效果: 业务 Handler 收到 `String`。
   - *缺点*: 只能传文本，不能直接传对象。

2. **Java 对象传输 (POJO)**:

   - 如果你想在 Handler 里直接收到 `User` 对象，需要**自定义解码器**或使用现有工具。

   - **原理**:

     ```java
     // 自定义解码器示例
     public class MyObjectDecoder extends ByteToMessageDecoder {
         @Override
         protected void decode(ChannelHandlerContext ctx, ByteBuf in, List<Object> out) {
             // 1. 读取 ByteBuf 里的字节
             // 2. 使用 Gson/Jackson 将 JSON 字节转为 User 对象
             User user = jsonUtils.toObject(in, User.class);
             // 3. 传递给下一个 Handler
             out.add(user);
         }
     }
     ```

   - **结果**:

     `public class MyHandler extends SimpleChannelInboundHandler<User>`

3. **常用编解码组件**:

   - `StringDecoder` / `StringEncoder`: 文本处理。
   - `ObjectDecoder` / `ObjectEncoder`: Java 原生序列化（不推荐，性能差）。
   - `ProtobufVarint32FrameDecoder`: Google Protobuf（高性能，大厂推荐）。
   - `JsonObjectDecoder`: 处理 JSON 分包问题。