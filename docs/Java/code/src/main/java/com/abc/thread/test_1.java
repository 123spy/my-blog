package com.abc.thread;

public class test_1 {

    public static void main(String[] args) {
        Long sum = 0L;

        long start = System.currentTimeMillis();

        // 提交任务并拿到结果
        for (long i = 0; i < 1000000000; i++) {
            sum += i;
        }

        long end = System.currentTimeMillis();

        System.out.println("结果: " + sum);
        System.out.println("耗时: " + (end - start) + "ms");
    }
}
