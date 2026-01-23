package com.abc.Class;

public class Person {

    public void eat() {
        System.out.println("eat");
    }

    public static void main(String[] args) {
        User user = new User();
        user.eat();
    }
}

class User extends Person {
    @Override
    public void eat() {
        super.eat();
    }
}
