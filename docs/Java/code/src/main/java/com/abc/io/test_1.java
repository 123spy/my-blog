package com.abc.io;

import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

public class test_1 {

    public static void main(String[] args) throws IOException {
        // 写文件
        FileOutputStream fos = new FileOutputStream("test.txt", true);
        fos.write("Hello, World".getBytes());
        fos.close();

        // 读文件
        FileInputStream fis = new FileInputStream("test.txt");
        int content;
        while((content = fis.read()) != -1) {
            System.out.println((char) content);
        }
        fis.close();
    }
}
