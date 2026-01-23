package club.shengsheng.netty;

import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;

public class NettyServer {

    public static void main(String[] args) {
        ServerBootstrap serverBootstrap = new ServerBootstrap();

        serverBootstrap.group(new NioEventLoopGroup(), new NioEventLoopGroup());
        serverBootstrap.channel(NioServerSocketChannel.class);

    }

}
