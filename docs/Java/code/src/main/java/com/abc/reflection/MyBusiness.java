package com.abc.reflection;

public class MyBusiness {

    @MyTest
    public void testLogin() {
        System.out.println("登陆测试通过");
    }


    public void otherMethod() {
        System.out.println("我没贴标签，别跑我");
    }
}
