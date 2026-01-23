package com.abc.io;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.ByteBuffer;
import java.nio.channels.SelectionKey;
import java.nio.channels.Selector;
import java.nio.channels.ServerSocketChannel;
import java.nio.channels.SocketChannel;
import java.util.Iterator;
import java.util.Set;

public class NIOServer {

    public static void main(String[] args) throws IOException {
        ServerSocketChannel serverChannel = ServerSocketChannel.open();
        serverChannel.bind(new InetSocketAddress(9999));

        // 设置为非阻塞模式
        serverChannel.configureBlocking(false);

        // 打开selector
        Selector selector = Selector.open();

        serverChannel.register(selector, SelectionKey.OP_ACCEPT);

        System.out.println("NIO 服务启动，等待事件......");

        while (true) {
            if(selector.select() == 0){
                continue;
            }

            Set<SelectionKey> selectionKeys = selector.selectedKeys();
            Iterator<SelectionKey> iterator = selectionKeys.iterator();

            while (iterator.hasNext()) {
                SelectionKey key = iterator.next();

                iterator.remove();

                if(key.isAcceptable()){
                    ServerSocketChannel server = (ServerSocketChannel) key.channel();
                    SocketChannel client = server.accept();
                    client.configureBlocking(false);

                    // 把这个新客户端也注册给经理，让他关注“读数据(READ)”事件
                    client.register(selector, SelectionKey.OP_READ);
                    System.out.println("客户端连接成功: " + client.getRemoteAddress());

                } else if(key.isReadable()){
                    SocketChannel client = (SocketChannel) key.channel();
                    ByteBuffer buffer = ByteBuffer.allocate(1024);

                    int len = client.read(buffer);
                    if(len > 0) {
                        System.out.println("收到消息: " + new String(buffer.array(), 0, len));
                    } else if(len == -1){
                        client.close();
                    }
                }
            }
        }
    }
}
