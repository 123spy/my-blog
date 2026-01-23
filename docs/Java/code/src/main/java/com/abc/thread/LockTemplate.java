package com.abc.thread;

import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

public class LockTemplate {
    private final Lock lock = new ReentrantLock();

    public void method() {
        lock.lock();
        try {
            System.out.println("拿到锁了");
            Thread.sleep(1000);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            lock.unlock();
        }
    }
}