<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;

class InvStockSede extends Model
{
    use Multitenantable;
    protected $table = 'inv_stock_sede';
    
    protected $fillable = [
        'producto_id',
        'sede_id',
        'cantidad'
    ];

    protected $casts = [
        'cantidad' => 'decimal:3',
    ];

    public function producto()
    {
        return $this->belongsTo(InvProducto::class, 'producto_id');
    }

    public function sede()
    {
        return $this->belongsTo(InvSede::class, 'sede_id');
    }
}
