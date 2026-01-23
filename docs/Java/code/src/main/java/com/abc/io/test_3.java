package com.abc.io;

import java.io.*;

public class test_3 {

    public static void main(String[] args) throws IOException {
        DataOutputStream dos = new DataOutputStream(new FileOutputStream("game_save.dat"));
        dos.writeInt(100);
        dos.writeBoolean(true);
        dos.writeUTF("玩家1");

        dos.close();

        // 读取，一定是要按照顺序读取
        DataInputStream dis = new DataInputStream(new FileInputStream("game_save.dat"));
        int score = dis.readInt();
        boolean isPass = dis.readBoolean();
        String name = dis.readUTF();

        System.out.println("玩家: " + name + ", 分数: " + score + ", 通关: " + isPass);
        dis.close();
    }
}
