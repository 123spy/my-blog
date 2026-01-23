package com.abc.io;

import java.io.*;
import java.util.ArrayList;

public class test_4 {

    public static void main(String[] args) throws IOException, ClassNotFoundException {
        ArrayList<String> list = new ArrayList<>();
        list.add("张三");
        list.add("李四");

        // 序列化
        ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("obj.dat"));
        oos.writeObject(list);
        oos.close();

        // 反序列化
        ObjectInputStream ois = new ObjectInputStream(new FileInputStream("obj.dat"));
        ArrayList<String> savedList = (ArrayList<String>) ois.readObject();
        System.out.println("恢复出来的名单" + savedList);
        ois.close();

    }

}
