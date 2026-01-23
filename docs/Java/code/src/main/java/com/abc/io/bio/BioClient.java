package com.abc.io.bio;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;

public class BioClient {

    public static void main(String[] args) throws IOException, InterruptedException {
        Thread jerry = new Thread(() -> {
            try {
                sendHello();
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        }, "jerry");

        Thread tom = new Thread(() -> {
            try {
                sendHello();
            } catch (IOException | InterruptedException e) {
                throw new RuntimeException(e);
            }
        }, "tom");

        jerry.start();
        tom.start();

        jerry.join();
        tom.join();
    }

    public static void sendHello() throws IOException, InterruptedException {
        Socket socket = new Socket();
        socket.connect(new InetSocketAddress("localhost", 8080));

        OutputStream outputStream = socket.getOutputStream();

        for (int i = 0; i < 10; i ++ ) {
            outputStream.write((Thread.currentThread().getName() + "hello" + i).getBytes());
            outputStream.flush();
        }

        Thread.sleep(50000);
        socket.close();
    }
}
