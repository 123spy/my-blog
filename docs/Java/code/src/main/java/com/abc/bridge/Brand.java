package com.abc.bridge;

public interface Brand {
    public void call();
    public void close();
    public void open();
}

class XiaoMi implements Brand {

    @Override
    public void call() {
        System.out.println("XiaoMi call");
    }

    @Override
    public void close() {
        System.out.println("XiaoMi close");
    }

    @Override
    public void open() {
        System.out.println("XiaoMi open");
    }
}

class HuaWei implements Brand {

    @Override
    public void call() {
        System.out.println("HuaWei call");
    }

    @Override
    public void close() {
        System.out.println("HuaWei close");
    }

    @Override
    public void open() {
        System.out.println("HuaWei open");
    }
}