package com.abc.thread;

import java.util.concurrent.CountDownLatch;

public class CountDownLatchDemo {

    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(3);

        new Thread(() -> {
            System.out.println("正在检查数据库...");
            try { Thread.sleep(1000); } catch (Exception e) {}
            System.out.println("数据库 OK");
            latch.countDown(); // 减 1
        }).start();

        new Thread(() -> {
            System.out.println("正在检查缓存...");
            try { Thread.sleep(2000); } catch (Exception e) {}
            System.out.println("缓存 OK");
            latch.countDown(); // 减 1
        }).start();

        new Thread(() -> {
            System.out.println("正在检查 MQ...");
            try { Thread.sleep(1500); } catch (Exception e) {}
            System.out.println("MQ OK");
            latch.countDown(); // 减 1
        }).start();

        System.out.println("主线程， 正在等待所有组件自检...");
        latch.await();

        System.out.println(">>> 所有组件就绪，系统正式启动！");
    }
}
