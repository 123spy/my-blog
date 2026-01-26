# IO

## 文件操作(File)

File对象是对路径的抽象，而不是对文件内容的抽象。想象它是一个“路牌”，路牌指向一个地方，但路牌本身并不关心那个地方存的是金子还是石头。

------

### File类常用API

1. 属性查询（看一看）

- exists()：判断文件/文件夹是否存在。
- isFile() / isDirectory()：判断是文件还是文件夹。
- length()：获取文件大小（字节数）。
- lastModified()：获取最后修改时间。

2. 获取路径（在哪儿）

- getName()：获取文件名（如 test.txt）。
- getPath()：获取创建File时给定的路径。
- getAbsolutePath()：获取绝对路径。
- getParent()：获取父级路径。

3. 创建与删除（动一动）

- createNewFile()：创建新文件（如果已存在则创建失败）。
- mkdir()：创建单层目录。
- mkdirs()：（推荐）递归创建多层目录（如果父文件夹不存在，它会一并创建）。
- delete()：删除文件或空文件夹。

4. 目录遍历（找一找）

- list()：返回 String 数组，包含所有文件名。
- listFiles()：（最常用）返回 File 数组，方便直接操作子文件对象。

------

### 面试考点

考点 1：mkdir()和mkdirs()的区别？

回答：mkdir()要求父目录必须存在，否则创建失败。mkdirs()会自动补全不存在的父目录。在实际开发中，为了代码健壮性，通常首选 mkdirs()。



考点 2：如何删除一个非空目录？

回答：File.delete() 只能删除文件或空文件夹。如果文件夹里有东西，删除会返回 false。
解决方案：必须使用递归。先进入目录，删除里面所有的子文件/子目录，最后再删除自己。



考点 3：路径分隔符的跨平台问题。

回答：Windows 用反斜杠 \，Linux/Mac 用正斜杠 /。
最佳实践：不要在代码里硬编码斜杠。应该使用 File.separator静态变量，或者直接用正斜杠 /（Java 在 Windows 下也能识别正斜杠）。

## 字节流

字节流（Byte Stream）是 Java 中最底层的 IO。

在计算机里，无论是文本、图片、音乐还是视频，最终都是以**二进制（0 和 1）**的形式存储在磁盘上的，这些二进制数据每8位就是一个**Byte（字节）**。

字节流就像一条**传送带**，它不关心传送带上放的是什么（是字符还是图片碎片），它只负责把一个又一个的字节（byte）从一个地方搬到另一个地方。

InputStream（输入流）：数据从外部（如硬盘文件）流向你的 Java 程序。

OutputStream（输出流）：数据从你的 Java 程序流向外部（如硬盘文件）。



字节流日常开发中你最常打交道的是这两个：

FileInputStream：

用途：从文件中读取字节。

场景：读取配置文件、读取图片数据进行处理等。



FileOutputStream：

用途：将字节写入文件。

场景：保存下载的文件、导出日志到本地等。



InputStream 的核心方法：

int read()：从输入流中读取一个字节。

注意：虽然读的是字节，但它返回一个 int，范围是 0-255。如果读到了文件末尾，它会返回-1。

void close()：关闭流，释放操作系统资源。



OutputStream 的核心方法：

void write(int b)：将一个字节写入输出流。
void flush()：强制将留在内存管道里的数据“刷”到目的地。
void close()：关闭流。



四、 面试高频考点

为什么 read() 方法返回int而不是 byte？

原因：字节（byte）的取值范围是 -128 到 127。如果 read()直接返回 byte，那么当文件中存的正好是 -1对应的二进制码时，程序会分不清这是“真实数据”还是“文件结束符”。
解决：Java 将字节提升为 int（范围 0 到 255）。这样，在这个范围内所有的数都是数据，而-1就可以被独立出来作为唯一的“文件读取完毕”标志。



字节流能处理中文吗？

答案：能，但不建议。

细节：字节流可以搬运中文字符的字节，但因为一个中文（UTF-8）占 3 个字节，如果你在读取过程中强行把这 3 个字节拆开来处理（比如一个一个字节转成 char 打印），就会出现乱码。

结论：处理纯文本，请找它的兄弟——**字符流**。



为什么一定要手动 close()？

答案：Java 的 GC（垃圾回收）只能管理内存中的对象，不能管理操作系统的底层资源（如文件句柄、网络端口）。如果不手动关闭，这些资源就会一直被占用，直到程序崩溃。



FileOutputStream 的追加模式

考点：默认情况下，new FileOutputStream("a.txt")会覆盖原文件。
解决：如果你想在原文件后面接着写，要用这个构造函数：new FileOutputStream("a.txt", true)。



## 字符流

### 一、 为什么需要字符流？

- 字节流：一次只读 1 个字节（8位）。

- 中文编码：在常见的 UTF-8 编码下，一个中文字符通常占用 3 个字节。

如果用字节流去读中文，会把一个汉字拆开。如果只读到了1/3个汉字就尝试打印，计算机会因为找不到对应的字符而显示乱码。

 

### 二、 Reader 与 Writer

字符流主要两个抽象基类：

- Reader：字符输入流（读文本）。

- Writer：字符输出流（写文本）。

 常用的实现类是：

- FileReader

- FileWriter

 

### 三、 核心区别与面试考点

#### 搬运单位不同

字节流：搬运的是 byte (8位)。

字符流：搬运的是 char (16位，在 Java 内部使用 Unicode 编码)。



扩展解释：

外部存储：文件编码 (UTF-8)

在硬盘中，文件是以某种编码格式(通常是 UTF-8)存储的。在UTF-8中，汉字确实通常占3个字节。此时，它是以“字节流”的形式存在的。



Java内部：字符的容器(char/UTF-16)

Java规定所有的char类型都使用Unicode(具体为UTF-16)编码。在UTF-16中，绝大多数常用字符(包括汉字)都统一占用 2 个字节(16位)。



操作流程：

读取：先从硬盘读取 3 个字节(假设是 UTF-8 编码的一个汉字)。

转换：它查了一下自己的编码表（翻译字典），发现这 3 个字节对应的是某个汉字。

封装：它把这个汉字转换成Java内存能识别的UTF-16格式，即2个字节的**char**。

交给程序：当你调用read()时，你拿到的是已经转换好的这1个char。

 

#### 字符流自带“隐形缓冲区”:full_moon:

程序用**FileWriter**写了一句话，程序运行完，但文件中竟然是空的！

原因：字节流是直接跟硬盘打交道，写一个字节就进硬盘一个。而字符流为了效率，内部有一个临时的缓冲区。

对策：你必须调用 .flush() 或者 .close()，数据才会从缓冲区被“推”进硬盘。



## 缓冲处理

普通的流就像是没有仓库的零售店：顾客要一个（程序调一次 read()），店家就跑去厂家拿一个（去硬盘读一次）。

缓冲流则是在内存里开辟了一个仓库（默认 8192 个单元的数组）。



### 缓冲过程

读取过程 (BufferedReader / BufferedInputStream)

当第一次调 read() 时，缓冲流会“自作主张”地让基础流从硬盘里一口气读 8192 个单位填满自己的仓库。

接下来的 8191 次 read() 都是直接从内存仓库里拿，不需要看硬盘脸色。

仓库拿空了，它再去硬盘搬下一车。



写入过程 (BufferedWriter / BufferedOutputStream)

当你调 write() 时，数据其实是先堆在内存仓库里。

只有当仓库装满了，或者你手动调了 flush() / close()，它才会把这一车数据“咣当”一下倒进硬盘。



### 核心类

字符缓冲流不仅快，还提供了两个专门处理**行**的杀手锏：

BufferedReader 的 readLine()

功能：读取一整行，直到遇到换行符（\n 或 \r\n）。

返回值：返回该行的字符串内容（不包含换行符）。

结束标志：如果读到文件末尾，返回 null。



BufferedWriter 的 newLine()

功能：写入一个行分隔符。

为什么牛：它是跨平台的。在 Windows 下它写 \r\n，在 Linux 下它写 \n。这比你手动写 \n 健壮得多。



### 面试题

#### 为什么缓冲流不直接操作文件，非要传一个基础流进去？

回答：这是为了解耦。缓冲流只负责“加仓库”这个逻辑，而不负责“读文件”或“读网络”或“读数组”。你可以把缓冲流套在FileReader上读文件，也可以套在 InputStreamReader上读网络，这体现了Java的**装饰器设计模式**。

 

#### 如果不关流，会有什么后果？（尤其是 BufferedWriter）

回答：除了资源泄漏，最严重的后果是数据丢失。因为数据可能还躺在 8192 字节的缓冲区里没满，没触发自动写入，程序就结束了。



#### 既然缓冲流快，那我把缓冲区设成 100MB 是不是更快？

回答：边际效应递减。默认的 8KB 是权衡了内存占用和磁盘 I/O 效率后的黄金值。盲目增大缓冲区会浪费内存，且对速度的提升微乎其微，因为瓶颈往往在于磁盘本身的物理寻址速度。



## 对象序列化

进入对象序列化（Object Serialization），就不再只是搬运简单的字节或字符了，而是在搬运**Java 对象**。

简单来说，序列化就是把内存里的Java对象转换成二进制字节流，从而可以保存到磁盘或在网络上传输；反序列化则是把这些字节流重新恢复为内存中的对象。



### 核心知识点

#### Serializable 接口：那张“门票”

一个 Java 类如果想被序列化，必须实现java.io.Serializable接口。

注意：这只是一个“标记接口”（里面没有任何方法）。它只是告诉 JVM：“这个类我检查过了，可以安全地转换成字节”。

 

#### ObjectOutputStream / ObjectInputStream

这是实现序列化的工具类：

- writeObject(Object obj)：将对象写入流。

- readObject()：从流中读取并还原对象。

 

#### serialVersionUID：对象的“版本号”

这是一个非常重要的隐藏属性。

作用：当你的类代码发生了修改（比如多了一个字段），反序列化时JVM会比对文件的UID和代码里的UID。如果对不上，直接报InvalidClassException（版本不兼容）。

 

### 开发细节

#### transient 关键字：敏感数据的“马赛克”

场景：如果你的 User 对象里有密码（password），你肯定不想把它明文存到硬盘上。

用法：在成员变量前加transient。

结果：序列化时，这个字段会被忽略；反序列化后，该字段恢复为默认值（如 null 或 0）。



#### 静态变量不参与序列化

原因：静态变量属于类，而不属于某个具体的对象。序列化搬运的是“对象的状态”。



#### 父子类的序列化关系

如果父类实现了 Serializable，子类自动拥有序列化能力。

如果父类没实现，但子类实现了：子类可以序列化，但父类定义的成员变量在还原时会丢失（除非父类有一个无参构造函数）。

 

### 面试题目

#### 为什么一定要手动定义 serialVersionUID？

答案：如果不手动定义，JVM 会根据类结构自动计算一个。但只要你改了一个空格或加个属性，这个自动生成的 UID 就会变。这意味着你昨天存的文件，今天代码改了一丁点，就再也读不出来了。为了兼容性，一定要手动写死一个 UID。

 

#### 如果对象里引用了另一个对象，序列化会成功吗？

答案：要求被引用的对象也必须实现 Serializable。否则会抛出 NotSerializableException。这叫**“序列化递归”**，它会尝试保存整个对象树。

 

#### Java 原生序列化的缺点是什么？（企业为什么常改用 JSON/Protobuf？）

非常核心：

安全性：非常容易受到反序列化炸弹攻击。

跨语言：只有 Java 能读，C++ 或 Go 读不了。

性能：产生的字节流体积大，速度慢。

替代方案：在微服务开发中，大家更倾向于使用 JSON (Jackson/Gson) 或 Protobuf。



#### 如果你在序列化一个对象后，把这个对象的某个字段类型从 int改成了 String，但是 serialVersionUID没变。你觉得反序列化时会报错吗？还是会尝试转换？

第一步（版本号）：检查 serialVersionUID。如果不一致，直接报错。这一步你通过了。

第二步（结构检查）：Java 会尝试把文件里的二进制数据填回类成员变量里。

- 当它发现文件里存的是 int类型（4字节），而你现在的代码要求填入String类型时，它无法完成这种跨类型的自动转换。
- 结果就是抛出 incompatible types for field ...（字段类型不兼容）。



## 特殊流

### DataInputStream / DataOutputStream（数据流）

这是专门为 “基本数据类型” 准备的流。



存在的意义

普通的字节流只能读写 byte 或 byte[]。如果你想存一个 double 类型的金额 99.88，或者一个 long 类型的时间戳，直接用字节流写会非常麻烦（你需要手动把 8 个字节拆开）。 数据流 封装了这些逻辑，让你能直接调用 readDouble() 或 writeLong()。



核心特性：机器无关性

它不仅是搬运工，还是“标准员”。它保证了在 Windows 上写的 long，拿到 Linux 或 Mac 上读出来还是那个 long，解决了不同系统的字节序（Endianness）兼容问题。



企业场景：协议头解析

在自定义网络通信协议时，包头通常是固定长度的。

 

例如：前 4 个字节是整型（消息长度），后 2 个字节是短整型（指令码）。

开发者会直接用 DataInputStream 包装 Socket 的输入流，直接 readInt() 拿到长度，readShort() 拿到指令。



### PrintStream / PrintWriter（打印流）

Java中的打印流（PrintStream与PrintWriter）是Java IO流体系中的重要组成部分，主要用于输出数据到目标位置（如控制台或文件）。

它们提供了丰富的重载方法，支持多种数据类型的输出，同时具备自动刷新功能，简化了开发流程。



核心特性

PrintStream：主要用于输出字节流，支持基本数据类型和字符串的输出。

PrintWriter：主要用于输出字符流，支持字符和字符串的输出。



使用场景

打印流通常与System.setOut()方法结合使用，可以重新指定输出目标，例如将控制台输出重定向到文件，方便数据保存与分析。



输出到控制台

```java
以下代码展示了如何使用PrintStream和PrintWriter将数据输出到控制台。

// PrintStream 示例PrintStream printStream = new PrintStream(System.out);

printStream.println("Hello, PrintStream!");

// PrintWriter 示例PrintWriter printWriter = new PrintWriter(System.out);

printWriter.println("Hello, PrintWriter!");

printWriter.flush(); // 手动刷新缓冲区
```



输出到文件

通过System.setOut()方法，可以将控制台输出重定向到文件。

```java
import java.io.FileOutputStream;import java.io.PrintStream;

public class PrintStreamExample {

  public static void main(String[] args) {

    try {

      // 创建文件输出流

      PrintStream printStream = new PrintStream(new FileOutputStream("output.txt"));

      // 重定向输出

      System.setOut(printStream);
      // 输出数据

     System.out.println("This is redirected to a file!");

    } catch (Exception e) {

      e.printStackTrace();

    }

  }}
```



自动刷新功能

``` java
PrintStream和PrintWriter支持自动刷新，确保数据及时写入目标位置。

import java.io.FileWriter;import java.io.PrintWriter;

public class PrintWriterExample {

  public static void main(String[] args) {

    try {

      // 创建文件写入流

      PrintWriter printWriter = new PrintWriter(new FileWriter("output.txt"), true);

      // 输出数据

      printWriter.println("This is written to a file with auto-flush!");

    } catch (Exception e) {

      e.printStackTrace();

    }

  }}
```



### ByteArrayInputStream / ByteArrayOutputStream（内存流）

这是一种**“不需要硬盘”的流。它的目的地不是文件，而是内存里的字节数组**。

存在的意义

有时候你手里有一个 byte[] 数组，但某个第三方接口（比如图片压缩工具类）只接收一个 InputStream 参数。这时候你不需要把数据存进临时文件，直接用 new ByteArrayInputStream(data) 就能把数组伪装成一个流。



企业场景：数据缓存与克隆

数据中转：在把数据发往网络之前，先在内存里用 ByteArrayOutputStream 拼装好，再一次性转成 toByteArray()。

深度克隆：虽然序列化慢，但在某些场景下，利用内存流序列化再反序列化，是实现对象深度克隆（Deep Copy）的一种骚操作。



### 面试高频必杀题

问：PrintStream 与 DataOutputStream 的区别是什么？

核心点：DataOutputStream 写入的是数据的二进制原始值。如果你 writeInt(97)，你用记事本打开文件，看到的是一个二进制乱码（或者 ASCII 的 'a'）。

核心点：PrintStream写入的是数据的字符串形式。如果你print(97)，它内部会把97转成字符 '9' 和 '7'，你打开记事本看到的就是肉眼可见的 97。
