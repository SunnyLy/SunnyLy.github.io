/*
 * SDK 35 AIDL 编译器生成代码的学习注释版。
 * 只整理空白和注释，保留生成器输出的代码逻辑。
 * 应用工程应由 IAdder.aidl 生成此文件，不要同时手动添加这个 Java 类。
 */
package com.example.binderstudy;

// 业务接口继承 IInterface，因而也有 asBinder()。
public interface IAdder extends android.os.IInterface {
  // 可选的默认实现；asInterface() 不会自动返回它，本例没有使用它。
  public static class Default implements com.example.binderstudy.IAdder {
    @Override public int add(int a, int b) throws android.os.RemoteException {
      return 0;
    }
    @Override public android.os.IBinder asBinder() {
      return null;
    }
  }

  // 服务端骨架：能接收 Binder 事务，但 add() 仍由 AdderImpl 实现。
  public static abstract class Stub extends android.os.Binder
      implements com.example.binderstudy.IAdder {
    @SuppressWarnings("this-escape")
    public Stub() {
      // 保存当前实现对象；创建 AdderImpl 时，这个 this 就是 AdderImpl。
      this.attachInterface(this, DESCRIPTOR);
    }

    // 把通用 IBinder 转成业务接口，选择本地直调或远端代理。
    public static com.example.binderstudy.IAdder asInterface(android.os.IBinder obj) {
      if ((obj == null)) {
        return null;
      }
      android.os.IInterface iin = obj.queryLocalInterface(DESCRIPTOR);
      if (((iin != null) && (iin instanceof com.example.binderstudy.IAdder))) {
        return ((com.example.binderstudy.IAdder) iin); // 本地：原实现对象。
      }
      return new com.example.binderstudy.IAdder.Stub.Proxy(obj); // 远端：业务代理。
    }

    @Override public android.os.IBinder asBinder() {
      return this; // Stub 本身继承 Binder，因此它自己就是 IBinder。
    }

    @Override public boolean onTransact(int code, android.os.Parcel data,
        android.os.Parcel reply, int flags) throws android.os.RemoteException {
      java.lang.String descriptor = DESCRIPTOR;
      // 业务事务先核对接口 token；这不是调用方身份认证。
      if (code >= android.os.IBinder.FIRST_CALL_TRANSACTION
          && code <= android.os.IBinder.LAST_CALL_TRANSACTION) {
        data.enforceInterface(descriptor);
      }
      if (code == INTERFACE_TRANSACTION) {
        reply.writeString(descriptor); // 查询接口描述，不执行 add()。
        return true;
      }
      switch (code) {
        case TRANSACTION_add: {
          int _arg0;
          _arg0 = data.readInt();
          int _arg1;
          _arg1 = data.readInt();
          // 虚方法分派：实际执行 AdderImpl.add()，业务本体在这里被调用。
          int _result = this.add(_arg0, _arg1);
          reply.writeNoException();
          reply.writeInt(_result);
          break;
        }
        default: {
          return super.onTransact(code, data, reply, flags);
        }
      }
      return true; // 表示已处理事务；业务结果在 reply 中，不是这个 boolean。
    }

    // 客户端业务代理：实现同一个 IAdder，但不执行实际的加法业务。
    private static class Proxy implements com.example.binderstudy.IAdder {
      private android.os.IBinder mRemote;

      Proxy(android.os.IBinder remote) {
        mRemote = remote; // 跨进程时通常是 BinderProxy，代表远端 Binder 引用。
      }
      @Override public android.os.IBinder asBinder() {
        return mRemote; // 返回持有的 Binder 引用，和 Stub 返回 this 不同。
      }
      public java.lang.String getInterfaceDescriptor() {
        return DESCRIPTOR;
      }
      @Override public int add(int a, int b) throws android.os.RemoteException {
        android.os.Parcel _data = android.os.Parcel.obtain();
        android.os.Parcel _reply = android.os.Parcel.obtain();
        int _result;
        try {
          _data.writeInterfaceToken(DESCRIPTOR);
          _data.writeInt(a);
          _data.writeInt(b);
          // 0：同步事务。_status 是事务处理标志，不是加法结果。
          boolean _status = mRemote.transact(Stub.TRANSACTION_add, _data, _reply, 0);
          _reply.readException();
          _result = _reply.readInt(); // 读取服务端写入 reply 的加法结果。
        } finally {
          _reply.recycle();
          _data.recycle();
        }
        return _result;
      }
    }

    // 本接口第一个业务方法的事务码；客户端和服务端使用同一份生成协议。
    static final int TRANSACTION_add = (android.os.IBinder.FIRST_CALL_TRANSACTION + 0);
  }

  /** @hide */
  public static final java.lang.String DESCRIPTOR = "com.example.binderstudy.IAdder";
  public int add(int a, int b) throws android.os.RemoteException;
}
