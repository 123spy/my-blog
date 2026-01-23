package com.abc.io;

import java.io.*;

public class test_2 {

    public static void main(String[] args) throws IOException {

        BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream("test.txt"));
        bos.write("这是高速写入".getBytes());

        // 这里是关键，只有当flush或者close的时候，这些数据才会真正的被写入到硬盘中
        bos.close();

        BufferedInputStream bis = new BufferedInputStream(new FileInputStream("test.txt"));
        byte[] buf = new byte[1024];
        int len;
        while ((len = bis.read(buf)) != -1) {
            System.out.println(new String(buf, 0, len));
        }
        bis.close();
    }
}
