import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;

public class AppUpdateReceiver extends BroadcastReceiver {
    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent.getAction().equals(Intent.ACTION_PACKAGE_ADDED)) {
            String packageName = intent.getData().getSchemeSpecificPart();

            if (packageName.equals(context.getPackageName())) {
                // Reiniciar la app automáticamente después de la instalación
                Intent launchIntent = context.getPackageManager()
                        .getLaunchIntentForPackage(packageName);
                if (launchIntent != null) {
                    launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(launchIntent);
                }
            }
        }
    }
}
