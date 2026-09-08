package com.clothsync.scanner

import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.clothsync.scanner.data.*
import com.clothsync.scanner.ui.ScannerViewModel
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) { super.onCreate(savedInstanceState); window.setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE); setContent { MaterialTheme(colorScheme = lightColorScheme(primary = Color(0xFF0F9F91), secondary = Color(0xFF065C59))) { Surface(Modifier.fillMaxSize()) { App() } } } }
}

@Composable private fun App(vm: ScannerViewModel = hiltViewModel()) {
    val state by vm.state.collectAsState()
    when {
        !state.loggedIn -> Login(state.loading, state.error, vm::login)
        state.scanner == null -> ScannerSelection(state, vm::selectScanner, vm::retryConnection, vm::logout)
        else -> BulkScan(state, vm::start, vm::stop, vm::clearData, vm::discardRejectedUploads, vm::changeScanner, vm::setManualAction, vm::refreshScanner, vm::logout)
    }
}

@Composable private fun Page(title: String, content: @Composable ColumnScope.() -> Unit) { Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(20.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) { Text(title, style = MaterialTheme.typography.headlineMedium); content() } }
@Composable private fun Login(loading: Boolean, error: String?, submit: (String, String) -> Unit) { var email by remember { mutableStateOf("") }; var password by remember { mutableStateOf("") }; Page("ClothSync Scanner") { Text("Business or Laundry login"); OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth()); OutlinedTextField(password, { password = it }, label = { Text("Password") }, visualTransformation = PasswordVisualTransformation(), modifier = Modifier.fillMaxWidth()); error?.let { Text(it, color = MaterialTheme.colorScheme.error) }; Button({ submit(email, password) }, enabled = !loading && email.isNotBlank() && password.isNotBlank(), modifier = Modifier.fillMaxWidth()) { Text(if (loading) "Signing in…" else "Sign In") } } }
@Composable private fun ScannerSelection(state: com.clothsync.scanner.ui.UiState, select: (ScannerDto) -> Unit, retry: () -> Unit, logout: () -> Unit) { Page("Select Scanner") { Text("${state.portal.replaceFirstChar { it.uppercase() }} portal"); if (state.loading) CircularProgressIndicator(); state.error?.let { Text(it, color = MaterialTheme.colorScheme.error) }; if (!state.loading) OutlinedButton(retry, modifier = Modifier.fillMaxWidth()) { Text("Refresh Scanner Connection") }; state.scanners.forEach { scanner -> val selectable = scanner.actualUuid() != null; Card(onClick = { if (selectable) select(scanner) }, enabled = selectable, modifier = Modifier.fillMaxWidth()) { Column(Modifier.padding(16.dp)) { Text(scanner.displayName(), style = MaterialTheme.typography.titleMedium); Text("Scanner code: ${scanner.displayCode()}"); Text("Type: ${scanner.scannerType.orEmpty()} · Mode: ${scanner.scannerMode.orEmpty()}"); Text("Location: ${scanner.displayLocation()}"); Text("Operator: ${scanner.assignedOperator?.fullName ?: "—"} · ${scanner.status.orEmpty()}"); if (!selectable) Text("Scanner UUID is missing", color = MaterialTheme.colorScheme.error) } } }; TextButton(logout) { Text("Logout") } } }
@Composable private fun BulkScan(state: com.clothsync.scanner.ui.UiState, start: () -> Unit, stop: () -> Unit, clear: () -> Unit, discardRejected: () -> Unit, changeScanner: () -> Unit, manual: (String) -> Unit, refresh: () -> Unit, logout: () -> Unit) { Page("Bulk Scan") { Text(if (state.connected) "RFID Connected" else "RFID Disconnected"); Text("Scanner: ${state.scanner?.displayName().orEmpty()}"); Text("Mode: ${state.scanner?.scannerMode.orEmpty()}"); Text("Location: ${state.scanner?.displayLocation() ?: "—"}"); if (BuildConfig.SCANNER_VARIANT == "fixed") Text("Fixed Manual stages tags for the portal. Entry, Exit and Auto follow backend session rules.") else if (state.portal == "laundry") Text("Batches are identified automatically from scanned tags"); if (state.scanner?.scannerMode.equals("manual", true) && BuildConfig.SCANNER_VARIANT != "fixed") { Text("Action: ${when (state.manualAction) { "check_out" -> "Check Out"; "read_only" -> "Read only"; else -> "Check In" }}", style = MaterialTheme.typography.titleMedium); Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) { FilterChip(!state.scanning && state.manualAction == "check_in", { if (!state.scanning) manual("check_in") }, { Text("Check In") }); FilterChip(!state.scanning && state.manualAction == "check_out", { if (!state.scanning) manual("check_out") }, { Text("Check Out") }); FilterChip(!state.scanning && state.manualAction == "read_only", { if (!state.scanning) manual("read_only") }, { Text("Read only") }) } }; Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) { Counter("Unique", state.unique); Counter("Processed", state.processed); Counter("Rejected", state.rejected) }; Text("Queued uploads: ${state.queued}"); if (state.queued > 0) { state.rejectedUploadReason?.let { reason -> Text("Rejected upload: $reason", color = MaterialTheme.colorScheme.error) }; OutlinedButton(discardRejected, enabled = !state.loading && !state.scanning, modifier = Modifier.fillMaxWidth()) { Text("Discard queued upload") } }; OutlinedButton(refresh, enabled = !state.loading && !state.scanning, modifier = Modifier.fillMaxWidth()) { Text(if (state.loading) "Refreshing…" else "Refresh Scanner Status") }; if (BuildConfig.SCANNER_VARIANT != "fixed") Button(start, enabled = !state.scanning && !state.loading && state.scanner?.actualUuid() != null && state.scanner.status.equals("active", true), modifier = Modifier.fillMaxWidth()) { Text("Bulk Scan") }; Button(stop, enabled = state.sessionId.isNotBlank() && !state.loading, modifier = Modifier.fillMaxWidth(), colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error)) { Text("Stop Scan") }; Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) { OutlinedButton(changeScanner, enabled = !state.loading, modifier = Modifier.weight(1f)) { Text("Back") }; OutlinedButton(clear, enabled = !state.scanning && !state.loading, modifier = Modifier.weight(1f)) { Text("Clear Data") } }; Text(state.message); if (state.results.isNotEmpty()) { Text("Scan results", style = MaterialTheme.typography.titleMedium); state.results.forEach { result -> Text("${result.epc} · ${result.statusLabel ?: result.status ?: if (result.accepted) "Accepted" else "Rejected"}${result.details?.let { " · $it" } ?: result.reason?.let { " · $it" } ?: ""}") } }; state.error?.let { Text(it, color = MaterialTheme.colorScheme.error) }; TextButton(logout) { Text("Logout") } } }
@Composable private fun Counter(label: String, value: Int) { Column { Text(value.toString(), style = MaterialTheme.typography.headlineSmall); Text(label, style = MaterialTheme.typography.labelSmall) } }
