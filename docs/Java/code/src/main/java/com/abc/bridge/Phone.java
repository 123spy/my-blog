package com.abc.bridge;

public abstract class Phone {

    Brand brand;
    public Phone(Brand brand) {
        this.brand = brand;
    }

    public void open() {
        brand.open();
    }

    public void close() {
        brand.close();
    }

    public void call() {
        brand.call();
    }
}


class FoldedPhone extends Phone {
    public FoldedPhone(Brand brand) {
        super(brand);
    }

    @Override
    public void open() {
        System.out.println("FoldedPhone open");
        super.open();
    }

    @Override
    public void call() {
        System.out.println("FoldedPhone call");
        super.call();
    }

    @Override
    public void close() {
        System.out.println("FoldedPhone close");
        super.close();
    }
}

class UprightPhone extends Phone {
    public UprightPhone(Brand brand) {
        super(brand);
    }

    @Override
    public void open() {
        System.out.println("UprightPhone open");
        super.open();
    }

    @Override
    public void call() {
        System.out.println("UprightPhone call");
        super.call();
    }

    @Override
    public void close() {
        System.out.println("UprightPhone close");
        super.close();
    }
}