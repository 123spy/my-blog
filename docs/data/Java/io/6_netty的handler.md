# Netty 常用编解码器与 Handler 大全

在 Netty 开发中，我们很少从零开始处理 `ByteBuf` 的每一个字节。Netty 提供了几十种现成的 `Handler`，覆盖了**基础编解码**、**粘包处理**、**协议支持**、**状态检测**等场景。

熟练使用这些组件，可以让你少写 80% 的底层代码。

## 1. 基础编解码抽象类 (自定义协议必看)

如果你要发明自己的协议（比如 `Message` 协议），你需要继承这些基类来实现逻辑。

| **类名**                   | **类型** | **作用与特点**                                               |
| -------------------------- | -------- | ------------------------------------------------------------ |
| **`ByteToMessageDecoder`** | 解码     | **最常用**。用于将字节流 (`ByteBuf`) 解码为 Java 对象。它内部维护了一个累积缓冲区，解决了字节数据碎片化的问题。你只需要实现 `decode()` 方法。 |
| **`ReplayingDecoder`**     | 解码     | **懒人专用**。继承自 `ByteToMessageDecoder`。它的特点是你**不需要检查** `readableBytes() > length`，直接读就行。如果字节不够，它会抛出特殊的 Error 并自动重试。*(缺点：性能略低于前者)*。 |
| **`MessageToByteEncoder`** | 编码     | **最常用**。用于将 Java 对象编码为字节流 (`ByteBuf`)。你只需要实现 `encode()` 方法。 |
| `MessageToMessageDecoder`  | 解码     | 用于“二次加工”。比如将 `String` 转为 `Integer`，或者将 `Protobuf对象` 转为 `User对象`。 |
| `MessageToMessageEncoder`  | 编码     | 用于“二次加工”。比如将 `User对象` 转为 `Protobuf对象`。      |

------

## 2. 解决 TCP 粘包/拆包的“拆包器” (FrameDecoder)

TCP 是流式的，没有界限。Netty 提供了 4 种开箱即用的 Decoder 来切分数据包，**这通常是 Pipeline 中的第一个 Handler**。

| **类名**                           | **适用场景**        | **原理**                                                     |
| ---------------------------------- | ------------------- | ------------------------------------------------------------ |
| **`FixedLengthFrameDecoder`**      | 定长协议            | 无论发送多少数据，我都按固定长度（比如 10 字节）切分。适合简单的指令传输。 |
| **`LineBasedFrameDecoder`**        | 文本协议            | 遇到换行符 (`\n` 或 `\r\n`) 就切分一个包。适合命令行工具、Telnet。 |
| **`DelimiterBasedFrameDecoder`**   | 特殊分隔符          | 遇到你指定的字符（比如 `$`, `_`）就切分。                    |
| **`LengthFieldBasedFrameDecoder`** | **通用协议 (最强)** | **工业级标准**。基于消息头中的“长度字段”来切分。比如前 4 个字节表示长度，它读取 4 字节后，自动往后读对应长度的数据。 |

> **实战建议**：做 IM、游戏、RPC，无脑选 `LengthFieldBasedFrameDecoder`。

------

## 3. 常见数据格式编解码 (序列化)

处理完粘包后，字节数组如何变成 Java 对象？

### 3.1 字符串与文本

- **`StringDecoder`**：将 `ByteBuf` 转为 `String`。
- **`StringEncoder`**：将 `String` 转为 `ByteBuf`。
- **`Base64Decoder` / `Base64Encoder`**：自动进行 Base64 转换。

### 3.2 Java 序列化 (不推荐)

- `ObjectEncoder` / `ObjectDecoder`：使用 Java 原生的 `Serializable`。
- *缺点*：序列化后的字节流太大，且无法跨语言（Java 只能跟 Java 聊），性能差。

### 3.3 Google Protobuf (推荐)

大厂最爱，性能极高，体积极小，支持多语言。

- **`ProtobufVarint32FrameDecoder`**：处理 Protobuf 特有的粘包格式。
- **`ProtobufDecoder`**：将字节自动转为 Protobuf 生成的 Java 对象。
- **`ProtobufEncoder`**：将 Protobuf 对象转为字节。

### 3.4 JSON

- `JsonObjectDecoder`：它是基于大括号 `{}` 匹配来处理 JSON 粘包的，但它**不会**把 JSON 字符串转成 Java 对象。
- *通常做法*：先用 `StringDecoder` 拿到 JSON 字符串，然后在业务 Handler 里用 Gson/Jackson 转对象。

------

## 4. 常用网络协议支持

Netty 内置了对主流应用层协议的支持，你甚至不需要自己写编解码器。

| **协议**         | **关键 Handler**                 | **作用**                                                     |
| ---------------- | -------------------------------- | ------------------------------------------------------------ |
| **HTTP / HTTPS** | `HttpServerCodec`                | 同时包含 HttpRequestDecoder 和 HttpResponseEncoder。让你可以直接处理 `FullHttpRequest` 对象。 |
| **WebSocket**    | `WebSocketServerProtocolHandler` | 自动处理 WebSocket 的握手、Ping/Pong 心跳、分帧。            |
| **HTTP2**        | `Http2FrameCodec`                | 支持新一代的 HTTP/2 协议。                                   |
| **DNS**          | `DatagramDnsQueryDecoder`        | 处理 UDP DNS 查询。                                          |

------

## 5. 实用工具 Handler (神器)

这些 Handler 可以在 Pipeline 中起到“辅助”作用。

### 5.1 `LoggingHandler` (调试神器)

- **作用**：打印详细的日志，包括读写了哪些字节（Hex Dump 格式）、发生了什么事件。
- **用法**：`pipeline.addLast(new LoggingHandler(LogLevel.INFO));`
- *场景*：当你发现收不到消息，或者消息乱码时，加上它，看看到底发了什么。

### 5.2 `IdleStateHandler` (心跳检测)

- **作用**：检测连接是否“空闲”。
- **用法**：`new IdleStateHandler(readerIdleTime, writerIdleTime, allIdleTime)`
- *场景*：如果你 60 秒没收到客户端消息，就触发一个事件，让你有机会断开连接（踢掉死链）。

### 5.3 `ChunkedWriteHandler` (大文件传输)

- **作用**：支持异步发送大的数据流（如文件），而不会导致内存溢出 (OOM)。
- *场景*：实现文件下载服务。