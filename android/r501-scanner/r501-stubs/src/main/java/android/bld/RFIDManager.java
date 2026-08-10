package android.bld;

import android.bld.rfid.aidl.RFIDServerListener;
import android.content.Context;

/** Compile-only signatures supplied at runtime by the R501 system framework. */
public class RFIDManager {
    public static RFIDManager getInstance(Context context) { throw new UnsupportedOperationException(); }
    public boolean open() { throw new UnsupportedOperationException(); }
    public boolean isOpened() { throw new UnsupportedOperationException(); }
    public boolean close() { throw new UnsupportedOperationException(); }
    public boolean connect() { throw new UnsupportedOperationException(); }
    public boolean isConnected() { throw new UnsupportedOperationException(); }
    public boolean disconnect() { throw new UnsupportedOperationException(); }
    public boolean startScan() { throw new UnsupportedOperationException(); }
    public boolean stopScan() { throw new UnsupportedOperationException(); }
    public void setContinuousScan(boolean enable) { throw new UnsupportedOperationException(); }
    public void setDisableSame(boolean disable) { throw new UnsupportedOperationException(); }
    public void setHandleKey(boolean enable) { throw new UnsupportedOperationException(); }
    public boolean setOutputMode(int mode) { throw new UnsupportedOperationException(); }
    public boolean setPower(int power) { throw new UnsupportedOperationException(); }
    public void setRFIDType(int type) { throw new UnsupportedOperationException(); }
    public int getRFIDType() { throw new UnsupportedOperationException(); }
    public void registerListener(RFIDServerListener listener) { throw new UnsupportedOperationException(); }
    public void unregisterListener(RFIDServerListener listener) { throw new UnsupportedOperationException(); }
}
