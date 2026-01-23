package com.abc.thread;

import java.util.concurrent.ForkJoinPool;
import java.util.concurrent.RecursiveTask;

public class test_2 {

    public static void main(String[] args) {
        ForkJoinPool pool = new ForkJoinPool();
        SumTask task = new SumTask(1, 1000000000L);

        long start = System.currentTimeMillis();

        // 提交任务并拿到结果
        Long result = pool.invoke(task);

        long end = System.currentTimeMillis();

        System.out.println("结果: " + result);
        System.out.println("耗时: " + (end - start) + "ms");
    }

    static class SumTask extends RecursiveTask<Long> {

        private static final int THRESHOLD = 10000;

        private long start;
        private long end;

        public SumTask(long start, long end) {
            this.start = start;
            this.end = end;
        }

        @Override
        protected Long compute() {
            long length = end - start;

            if(length<=THRESHOLD){
                long sum=0;
                for(long i=start;i<=end;i++){
                    sum+=i;
                }
                return sum;
            } else {
                long middle = (start+end)/2;
                SumTask leftTask = new SumTask(start, middle);
                SumTask rightTask = new SumTask(middle + 1, end);

                leftTask.fork();
                rightTask.fork();

                return leftTask.join() + rightTask.join();
            }
        }
    }
}
