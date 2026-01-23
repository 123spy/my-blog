package com.abc.thread;

import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.ThreadFactory;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class ThreadPoolDemo {

    public static void main(String[] args) {
        ThreadFactory myFactory = new ThreadFactory() {

            private final AtomicInteger count = new AtomicInteger();

            @Override
            public Thread newThread(Runnable r) {
                return new Thread("My-Business-" + count.getAndIncrement()) {
                };
            }
        };

        ThreadPoolExecutor executor = new ThreadPoolExecutor(
                2,
                5,
                10, TimeUnit.SECONDS,
                new ArrayBlockingQueue<>(10),
                myFactory,
                new ThreadPoolExecutor.AbortPolicy()
        );

        try {
            for (int i = 1; i <= 20; i++) {
                final int taskId = i;
                executor.execute(() -> {
                    System.out.println(Thread.currentThread().getName() + " 正在办理业务: " + taskId);
                    try {
                        TimeUnit.SECONDS.sleep(1); // 模拟耗时
                    } catch (InterruptedException e) {
                        e.printStackTrace();
                    }
                });
            }
        } finally {
            executor.shutdown();
        }



    }

}
