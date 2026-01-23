# Java 核心知识点整理

## 一、面向对象编程

### 1.1 类与对象

#### 构造函数

- **名称必须与类名完全相同**
- **没有返回类型**（void也不行）
- 不能被 `static`、`final`、`abstract`修饰
- 支持重载（一个类可以有多个构造函数）

```
class A {
    public A() {
        System.out.print("A ");
    }
}

class B extends A {
    public B() {
        this(10);  // 如果写了this，编译器不会添加super
        System.out.print("B ");
    }
    
    public B(int x) {
        // 如果this和super都不显式写出，默认添加super()
        System.out.print("B" + x + " ");
    }
}
```

#### 方法重载（Overload）

- 方法名必须相同
- 参数列表必须不同（类型、个数、顺序）
- 返回类型可以不同
- 不能仅通过访问修饰符或返回类型不同来重载

```
public class Calculator {
    public int add(int a, int b) { return a + b; }
    public double add(double a, double b) { return a + b; }  // 参数类型不同
    public int add(int a, int b, int c) { return a + b + c; }  // 参数个数不同
}
```



```java
public class Test {

    public void myMethod(Object o) {

        System.out.println("My Object");

 }

public void myMethod(String s) {

    System.out.println("My String");

}

public static void main(String args[]) {

    Test t = new Test();

    t.myMethod(null);

   }

}
```

当调用重载方法时，Java会选择最具体(最明确)的匹配。在本例中：

1. null可以匹配Object类型参数
2. null也可以匹配String类型参数
3. 由于String是Object的子类，所以String类型更具体，因此编译器会选择myMethod(String s)这个版本



#### 方法重写（Override）

- 子类重新实现父类方法
- 访问权限不能比父类更严格
- 私有方法不能被重写
- 静态方法绑定在编译期（方法隐藏，不是重写）

```
class Parent {
    public static void staticMethod() {
        System.out.println("Parent static");
    }
}

class Child extends Parent {
    public static void staticMethod() {  // 方法隐藏，不是重写
        System.out.println("Child static");
    }
}
```

### 1.2 抽象类 vs 接口

| 特性     | 抽象类                 | 接口                              |
| -------- | ---------------------- | --------------------------------- |
| 关系     | "is-a"（猫是一种动物） | "has-a"（动物有奔跑能力）         |
| 继承     | 单继承                 | 多实现                            |
| 方法     | 可有具体方法           | Java 8+ 支持默认方法和静态方法    |
| 成员变量 | 可有实例变量           | 只能是常量（public static final） |

### 1.3 Object 类

Object 类提供的基本方法：

- `equals(Object obj)`- 对象相等比较
- `hashCode()`- 返回哈希码
- `toString()`- 返回字符串表示
- `getClass()`- 返回运行时类
- `clone()`- 创建对象副本
- `wait()/notify()/notifyAll()`- 线程同步
- `finalize()`- 垃圾回收前调用（不建议依赖）

### 1.4 new对象过程

1. **在栈内存分配变量 a 的空间**（类型为 A 的引用变量，存储对象的地址）。
2. **在堆内存分配存储空间**（为 A 的对象分配内存）。
3. **在分配好的堆内存空间实例化 A 对象**（初始化成员变量并执行构造函数）。
4. **将 a 变量指向分配的堆内存地址**（引用变量 a 存储堆内存地址，指向对象）。

关键分析：

- **栈分配优先**：声明 A a 时，栈内存会先分配空间给引用变量 a（此时 a 未指向任何对象）。
- **堆分配与实例化**：new A() 触发堆内存分配，随后在堆中完成对象初始化（包括默认值赋值和构造函数执行）。
- **引用赋值最后**：对象初始化完成后，堆内存地址才会赋给栈中的变量 a。



## 二、关键字详解

### 2.1 final 关键字

#### 修饰对象

- **类**：不能被继承
- **方法**：不能被重写
- **变量**：常量，赋值后不能修改

#### final 常量初始化时机

| 变量类型 | 初始化时机             | 初始化位置                     |
| -------- | ---------------------- | ------------------------------ |
| 实例变量 | 构造函数结束前         | 声明时/构造函数中/实例初始化块 |
| 静态变量 | 类加载完成前           | 声明时/静态初始化块            |
| 局部变量 | 使用前（只能赋值一次） | 声明时/后续代码中              |

### 2.2 static 关键字

#### 静态成员特点

- 属于类，不属于实例对象
- 实例对象可以访问静态成员（不推荐）
- 静态方法中不能直接访问实例成员

```
class Test {
    public static void hello() {
        System.out.println("hello");
    }
}

// 使用
Test test = null;
test.hello();  // 可以运行，因为是类方法
```

## 三、数据类型与运算符

### 3.1 基本数据类型

| 类型    | 大小 | 范围         | 默认值   |
| ------- | ---- | ------------ | -------- |
| byte    | 8位  | -128~127     | 0        |
| short   | 16位 | -32768~32767 | 0        |
| int     | 32位 | -2³¹~2³¹-1   | 0        |
| long    | 64位 | -2⁶³~2⁶³-1   | 0L       |
| float   | 32位 | 约±3.4E38    | 0.0f     |
| double  | 64位 | 约±1.7E308   | 0.0d     |
| char    | 16位 | 0~65535      | '\u0000' |
| boolean | 1位  | true/false   | false    |

### 3.2 进制表示

| 进制     | 前缀        | 示例                 |
| -------- | ----------- | -------------------- |
| 十进制   | 无          | `int a = 100;`       |
| 二进制   | `0b`或 `0B` | `int b = 0b1100100;` |
| 八进制   | `0`         | `int c = 0144;`      |
| 十六进制 | `0x`或 `0X` | `int d = 0x64;`      |

### 3.3 类型转换规则

- 布尔类型不能转换为数值类型
- 小范围类型可自动转换为大范围类型
- 大范围转小范围需要强制类型转换

## 四、数组与字符串

### 4.1 数组创建

```
// 三种创建方式
int[] arr1 = new int[5];           // 方式1
int[] arr2 = {1, 2, 3, 4, 5};      // 方式2  
int[] arr3;
arr3 = new int[]{1, 2, 3};         // 方式3
```

### 4.2 数组拷贝方式比较

| 方式             | 原理                 | 效率 | 特点               |
| ---------------- | -------------------- | ---- | ------------------ |
| for循环          | 逐一复制             | 最低 | 最直观，可控制逻辑 |
| System.arraycopy | 内存块拷贝           | 最高 | JVM本地方法        |
| Arrays.copyOf    | 调用System.arraycopy | 高   | 内部创建新数组     |
| clone方法        | Object的native方法   | 较高 | 创建浅拷贝副本     |

### 4.3 字符串相关

- String：不可变字符序列
- StringBuffer：线程安全，可变字符序列
- StringBuilder：非线程安全，性能更高

## 五、集合框架

### 5.1 主要集合类

#### LinkedList

- 实现 List、Deque 接口
- 双向链表实现
- 可作为队列或栈使用

```
// LinkedList 节点结构
private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}
```

#### TreeSet

- 元素唯一且有序
- 默认自然排序（元素实现Comparable）
- 支持Comparator自定义排序

#### Stack（不推荐）

- 继承Vector，线程安全但性能差
- 推荐使用Deque替代

```
// 推荐使用Deque作为栈
Deque<String> stack = new ArrayDeque<>();
stack.push("A");  // 入栈
stack.pop();      // 出栈
```

## 六、高级特性

### 6.1 枚举（Enum）

```
public enum Color {
    RED, GREEN, BLUE;  // 枚举常量
    
    // 可以包含构造函数（默认私有）
    Color() {
        // 构造函数
    }
    
    // 可以实现接口
    public interface Colorable {
        String getColorCode();
    }
}
```

**枚举特性：**

- 构造函数必须为私有（默认隐式私有）
- 可以实现接口，不能继承类
- 隐式继承java.lang.Enum

### 6.2 内部类

| 类型       | 访问权限           | 静态成员                 | 特点               |
| ---------- | ------------------ | ------------------------ | ------------------ |
| 成员内部类 | 访问外部类所有成员 | 不能有（除static final） | 依赖外部类实例     |
| 静态内部类 | 只能访问静态成员   | 可以有                   | 不依赖外部类实例   |
| 局部内部类 | 方法内使用         | 不能有                   | 访问final局部变量  |
| 匿名内部类 | 实现接口/继承类    | 不能有                   | 简洁写法可用Lambda |

### 6.3 异常处理

#### 异常体系

```
Throwable
    ├── Error（系统错误，不应捕获）
    └── Exception（可处理异常）
        ├── RuntimeException（运行时异常）
        └── 其他Exception（受检异常）
```

#### try-catch-finally

```
try {
    // 可能抛出异常的代码
} catch (ExceptionType e) {
    // 异常处理
} finally {
    // 总是执行的代码（可选）
}

// 允许只有try-finally，没有catch
try {
    // 代码
} finally {
    // 清理资源
}
```



### Arrays

Arrays.asList() 方法返回的是一个固定大小的 List，这个 List 是 Arrays 的内部类 ArrayList 的实例，而不是 java.util.ArrayList。这个固定大小的 List 不支持添加或删除操作。

当尝试调用 list.add("D") 时，会抛出 UnsupportedOperationException 运行时异常。



## 七、多线程

### 7.1 线程基本操作

- `start()`- 启动线程
- `run()`- 线程执行体
- `sleep()`- 线程暂停
- `interrupt()`- 中断线程
- `join()`- 等待线程终止
- `yield()`- 让出CPU

### 7.2 线程状态

- 调用`sleep()`进入TIMED_WAITING状态，不是终止
- 线程终止需要自然结束或被中断

## 八、Java规范

### 8.1 标识符规则

- 组成：字母、数字、下划线(_)、美元符号($)
- 开头：字母、下划线或美元符号（不能是数字）
- 区分大小写，不能使用关键字

### 8.2 包与导入

- `java.lang`包自动导入（包含String、Object等基础类）
- 源文件中定义n个类/接口，编译生成n个.class文件

### 8.3 字符编码

- Java使用Unicode字符集
- 支持国际化字符处理

### 8.4 位运算符

位运算符（如<<）**仅支持整数类型**（int、long、char、byte、short）

逻辑非运算符!**仅适用于布尔类型**

逻辑与&&要求两边均为布尔类型

按位或运算符|**要求两边均为整数类型**



\>> 是算术右移运算符，它使所有的位向右移动，但保持符号位不变。对于负数，左边会自动补1，正数则补0。

\>>> 是逻辑右移运算符（也称无符号右移），它使所有的位向右移动，并且左边总是补0，不管原来的数是正数还是负数。

在java中，没有<<<这个样子的逻辑左移

### 8.5 C++与Java的区别

```
// java
byte i = 127;  // ✅
i += 1;        // 结果是 -128（溢出）

// C++
byte i = 128;  // C++中byte通常是unsigned char
i += 1;        // 结果是129（如果是unsigned char）
```

### 8.6 赋值规则

小：long（在int范围外的，必须加l。在int范围内的不需要加）,float（如果是带着小数点的必须加f，反之不加）

大Long（必须加）, Float（必须加）,Double（只有面对整数例如100的时候才需要加）


```java
// ✅ 合法赋值
byte b1 = 127;      // 在byte范围[-128, 127]内
short s1 = 32767;   // 在short范围[-32768, 32767]内
char c1 = 65535;    // 在char范围[0, 65535]内
int i1 = 2147483647;// 在int范围内
long l1 = 2147483647L; // 必须有L后缀（超过int范围时）
float f1 = 3;       // 正确
float f1 = 3.14f;   // 遇到小数点，必须有f后缀
double d1 = 3.14;   // 合法

// ❌ 编译错误（硬性规则！）
byte b2 = 128;      // 错误：128超出byte范围
short s2 = 32768;   // 错误：超出short范围
char c2 = 65536;    // 错误：超出char范围
int i2 = 2147483648; // 错误：超出int范围（需要加L）
long l2 = 9223372036854775807L; // 正确
long l3 = 9223372036854775808L; // 错误：超出long范围
float f2 = 3.14;    // 错误：带有小数的，需要f后缀（3.14默认是double）

// 这些字面量虽然看起来像int，但编译器会特殊处理
byte b3 = 0b01111111;    // 二进制，必须在byte范围内
byte b4 = 0177;          // 八进制，必须在byte范围内
byte b5 = 0x7F;          // 十六进制，必须在byte范围内

// ❌ 编译错误
byte b6 = 0b10000000;    // 128，超出byte范围
```



Long 类型 - 必须加 `L` 或 `l` 后缀

```java
// ✅ 正确用法
Long l1 = 100L;          // 必须加L
Long l2 = 2147483648L;   // 超过int范围，必须加L
Long l3 = 100l;          // 小写l也可以（但易混淆，不推荐）

// ❌ 编译错误（硬性规则！）
Long l4 = 100;           // 错误：需要L后缀
Long l5 = 2147483648;    // 错误：超int范围且无L后缀
Long l6 = 9223372036854775807;  // 错误：无L后缀

// ⚠️ 特殊注意：即使数值在int范围内，也必须加L
Long l7 = 1;             // 错误！必须加L
Long l8 = 0;             // 错误！必须加L
Long l9 = -100;          // 错误！必须加L
```



Float 类型 - 必须加 `f` 或 `F` 后缀

```java
// ✅ 正确用法
Float f1 = 3.14f;        // 必须加f
Float f2 = 100.0F;       // 大写F也可以
Float f3 = 1e-10f;       // 科学计数法也要加f
Float f4 = 100f;         // 整数也需要f后缀

// ❌ 编译错误
Float f5 = 3.14;         // 错误：3.14默认是double，需要f后缀
Float f6 = 100;          // 错误：整数也需要f后缀
Float f7 = 1.0e10;       // 错误：科学计数法也需要f后缀

// ✅ 这些特殊值有特定写法
Float f8 = 3.14f;
Float f9 = Float.POSITIVE_INFINITY;  // 特殊值
Float f10 = Float.NaN;              // 特殊值
```



Double 类型 - 可选加 `d` 或 `D`

```java
// ✅ 所有都正确（d后缀可选）
Double d1 = 3.14;        // 正确：不加d默认就是double
Double d2 = 3.14d;       // 正确：加d明确指定
Double d3 = 100.0;       // 正确
Double d4 = 100d;        // 正确：整数加d也是double
Double d5 = 1e10;        // 正确：科学计数法默认double

// ⚠️ 但整数必须加小数点或d后缀才能成为double
Double d6 = 100;         // ❌ 错误：100是int，需要转换
Double d7 = 100.0;       // ✅ 正确：有小数点
Double d8 = 100d;        // ✅ 正确：有d后缀
Double d9 = (double)100; // ✅ 正确：强制转换
```



Integer, Byte, Short, Character 类型

```java
// Integer - 使用int字面量
Integer i1 = 100;              // ✅ 正确
Integer i2 = 2147483647;       // ✅ int最大值
Integer i3 = 2147483648;       // ❌ 错误：超出int范围

// Byte - 必须在byte范围内
Byte b1 = 127;                 // ✅ byte最大值
Byte b2 = 128;                 // ❌ 错误：超出byte范围
Byte b3 = (byte)128;           // ✅ 正确：但值是-128

// Short - 必须在short范围内
Short s1 = 32767;              // ✅ short最大值  
Short s2 = 32768;              // ❌ 错误：超出short范围

// Character - 必须在char范围内
Character c1 = 65535;          // ✅ char最大值
Character c2 = 65536;          // ❌ 错误：超出char范围
Character c3 = 'A';            // ✅ 字符字面量
Character c4 = 65;             // ✅ 在0-65535内
```

### 8.7 缓存常量池

| 包装类        | 缓存范围    | 可配置                |
| :------------ | :---------- | :-------------------- |
| **Byte**      | -128 ~ 127  | 不可修改              |
| **Short**     | -128 ~ 127  | 不可修改              |
| **Integer**   | -128 ~ 127  | 可通过JVM参数修改上限 |
| **Long**      | -128 ~ 127  | 不可修改              |
| **Character** | 0 ~ 127     | 不可修改              |
| **Boolean**   | TRUE, FALSE | 只有这两个值          |
| **Float**     | 无缓存      | -                     |
| **Double**    | 无缓存      | -                     |



## 九、重要概念区分

### 9.1 深拷贝 vs 浅拷贝

- **浅拷贝**：复制对象引用，共享成员对象
- **深拷贝**：复制对象及其引用的所有对象

### 9.2 虚方法 vs 抽象方法

- **虚方法**：非private、非static、非final的实例方法，支持多态
- **抽象方法**：无方法体，必须由子类实现

### 9.3 this关键字限制

- 不能用于调用静态方法和访问静态变量
- 静态成员应通过类名访问

### 9.4 switch语句支持类型

- 支持：int、byte、short、char、枚举、String（Java 7+）
- 不支持：float、double等浮点类型

这个重新组织的结构按照逻辑主题进行分类，每个部分都有清晰的层次结构，便于学习和查阅。