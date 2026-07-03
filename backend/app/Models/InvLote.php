<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Traits\Multitenantable;

class InvLote extends Model
{
    use Multitenantable;
}
