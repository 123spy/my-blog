package com.abc.reflection;

import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class test_1 {
    public static void main(String[] args) throws ClassNotFoundException, NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException, NoSuchFieldException {
        Class<?> UserClass = Class.forName("com.abc.reflection.User");
        Object userObj = UserClass.getDeclaredConstructor().newInstance();
        System.out.println(userObj);

        Method[] declaredMethods = UserClass.getDeclaredMethods();
        for (Method m : declaredMethods) {
            System.out.println(m);
        }
        Method sayHi = UserClass.getDeclaredMethod("sayHi");
        sayHi.invoke(userObj);

        Field field = UserClass.getDeclaredField("name");
        field.setAccessible(true);
        System.out.println(field.get(userObj));

    }
}
