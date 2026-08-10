package android.bld.rfid.aidl;

/** Compile-only callback supplied at runtime by the R501 system framework. */
public interface RFIDServerListener {
    void onBoot(boolean first, boolean second);
    void onClose(boolean success);
    void onConnect(boolean success);
    void onDisconnect(boolean success);
    void onOpen(boolean success);
    void onScanData(TagData tagData);
}
