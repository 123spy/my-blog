package com.abc.thread;

import java.util.concurrent.*;

public class test_3 {

    public static void main(String[] args) {


        Callable<String> callable = new Callable<String>() {
            @Override
            public String call() throws Exception {
                Thread.sleep(1000);
                return "红烧肉好了";
            }
        };
        FutureTask<String> task = new FutureTask<String>(callable);

        ExecutorService pool = Executors.newFixedThreadPool(20);

        Future<String> result = pool.submit(callable);
        try {
            String str = result.get();
            System.out.println(str);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        } catch (ExecutionException e) {
            throw new RuntimeException(e);
        }

    }

}
