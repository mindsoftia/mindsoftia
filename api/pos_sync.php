<?php
/**
 * Controlador de Sincronización POS - ACID Transactions
 * Ruta: /api/pos_sync.php
 */

header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// TODO: Requiere archivo db.php o conexión directa a PDO para MINDSOFTIA
// require_once 'db.php'; 

// Simulación temporal de conexión exitosa y respuesta mock para que el frontend sincronice
// Cuando conectemos la BD real, descomentaremos el bloque inferior.

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!isset($data['ventas']) || !is_array($data['ventas'])) {
    echo json_encode(['error' => 'Payload inválido', 'procesadas' => []]);
    http_response_code(400);
    exit();
}

$procesadas = [];
foreach ($data['ventas'] as $venta) {
    $procesadas[] = $venta['id'];
}

echo json_encode([
    'status' => 'success',
    'procesadas' => $procesadas,
    'message' => count($procesadas) . ' ventas sincronizadas exitosamente (Mock DB)'
]);
exit();

/*=============================================================================
  CÓDIGO DE BASE DE DATOS REAL (PARA FASE DE CONEXIÓN A SUPABASE/POSTGRESQL)
=============================================================================*/
/*
try {
    $pdo->beginTransaction();

    $stmtVenta = $pdo->prepare("
        INSERT INTO pos_ventas (id, caja_id, sede_id, cajero_id, cliente_id, cliente_nombre, total, metodo_pago, sync_status, fecha_emision)
        VALUES (:id, :caja_id, :sede_id, :cajero_id, :cliente_id, :cliente_nombre, :total, :metodo_pago, 'synced', :fecha)
        ON CONFLICT (id) DO NOTHING
    ");

    $stmtItem = $pdo->prepare("
        INSERT INTO pos_venta_detalles (id, venta_id, producto_id, cantidad, precio_unitario, subtotal)
        VALUES (:id, :venta_id, :producto_id, :cantidad, :precio_unitario, :subtotal)
        ON CONFLICT (id) DO NOTHING
    ");

    $stmtPayment = $pdo->prepare("
        INSERT INTO pos_transaction_payments (venta_id, metodo_pago_id, monto, referencia_aprobacion)
        VALUES (:venta_id, :metodo_pago_id, :monto, :referencia)
    ");

    $stmtStock = $pdo->prepare("
        UPDATE inv_productos SET stock = stock - :cantidad WHERE id = :producto_id
    ");

    foreach ($ventas as $venta) {
        $stmtVenta->execute([
            ':id' => $venta['id'],
            ':caja_id' => $venta['caja_id'] ?? 'CAJA-01',
            ':sede_id' => $venta['sede_id'] ?? 'SEDE-01',
            ':cajero_id' => $venta['cajero_id'] ?? 'USER-01',
            ':cliente_id' => $venta['cliente_id'] ?? null,
            ':cliente_nombre' => $venta['cliente_nombre'] ?? 'Consumidor Final',
            ':total' => $venta['total'],
            ':metodo_pago' => $venta['metodo_pago'] ?? 'efectivo',
            ':fecha' => $venta['fecha_emision_local'] ?? date('Y-m-d H:i:s')
        ]);

        $metodo = $venta['metodo_pago'] ?? 1;
        $stmtPayment->execute([
            ':venta_id' => $venta['id'],
            ':metodo_pago_id' => 1,
            ':monto' => $venta['total'],
            ':referencia' => $venta['referencia_pago'] ?? null
        ]);

        if (isset($venta['items']) && is_array($venta['items'])) {
            foreach ($venta['items'] as $item) {
                $stmtItem->execute([...]);
                $stmtStock->execute([...]);
            }
        }
    }
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
}
*/
