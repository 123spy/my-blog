package com.abc.generics;

import java.util.ArrayList;
import java.util.List;

public class test_3 {

    public static void main(String[] args) {

        // 只读不写
        // 这个集合可能是 List<Animal>，也可能是 List<Cat>，也可能是 List<Dog>
        List<? extends Animal> animals = new ArrayList<Cat>();

        // 【读取】：是可以的
        // 因为不管它具体是 Cat 还是 Dog，它肯定是个 Animal
        Animal a = animals.get(0);

        // 【写入】：是禁止的！！（编译报错）
        // animals.add(new Dog()); // 错！万一实际指向的是 List<Cat> 怎么办？
        // animals.add(new Cat()); // 错！万一实际指向的是 List<Dog> 怎么办？
        // animals.add(new Animal()); // 错！


        // 只写不读是向上
        // 这个集合可能是 List<Cat>，也可能是 List<Animal>，也可能是 List<Object>
        List<? super Cat> list = new ArrayList<Animal>();

        // 【写入】：是可以的
        // 无论它实际上是 Animal List 还是 Object List，我放一个 Cat 进去肯定是安全的
        list.add(new Cat());
        list.add(new SmallCat()); // Cat 的子类也可以

        // 【读取】：受限
        // 因为不知道它具体是哪一级的父类（可能是 Object），所以取出来只能是 Object
        Object obj = list.get(0); // 丢失了具体类型信息
    }
}

class Animal {

}

class Cat extends Animal {
}

class SmallCat extends Cat {}

class Dog extends Animal {
}