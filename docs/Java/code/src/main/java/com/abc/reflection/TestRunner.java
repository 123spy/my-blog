package com.abc.reflection;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

public class TestRunner {
    public static void main(String[] args) throws NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException {
        Class<?> clazz = MyBusiness.class;

        // 实例化
        float a = 3.2;

        Object obj = clazz.getDeclaredConstructor().newInstance();

        // 遍历方法
        Method[] methods = clazz.getMethods();

        for (Method method : methods) {
            // 判断逻辑
            if(method.isAnnotationPresent(MyTest.class)) {
                System.out.println("正在自动测试方法: " + method.getName());
                method.invoke(obj);
            }
        }
    }
}
