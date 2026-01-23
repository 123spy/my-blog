package com.abc.thread;

import java.util.concurrent.CyclicBarrier;

public class CyclicBarrierDemo {

    public static void main(String[] args) {
        CyclicBarrier barrier = new CyclicBarrier(2, () -> {
            System.out.println(">>> 人齐了，开始汇总数据！(我是主线程任务)");
        });

        // 线程 A
        new Thread(() -> {
            try {
                System.out.println("线程 A 正在计算...");
                Thread.sleep(1000);
                System.out.println("线程 A 算完了，等队友。");
                barrier.await(); // 到达屏障
                System.out.println("线程 A 继续后面的工作...");
            } catch (Exception e) {}
        }).start();


        // 线程 B
        new Thread(() -> {
            try {
                System.out.println("线程 B 正在计算...");
                Thread.sleep(2000); // 算得慢
                System.out.println("线程 B 算完了，等队友。");
                barrier.await(); // 到达屏障
                System.out.println("线程 B 继续后面的工作...");
            } catch (Exception e) {}
        }).start();

        System.out.println("主线程后面去了");
    }

}
