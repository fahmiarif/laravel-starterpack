<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Menu extends Model
{
    use HasUuids, SoftDeletes, LogsActivity;

    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'parent_id',
        'title',
        'url',
        'icon',
        'order',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order' => 'integer',
    ];

    /**
     * Boot the model.
     * Fix for PostgreSQL + PDO emulated prepares: boolean values must be
     * sent as SQL literals, not PHP booleans (which PDO converts to 1/0).
     */
    protected static function booted(): void
    {
        static::saving(function (Menu $menu) {
            $menu->is_active = \Illuminate\Support\Facades\DB::raw($menu->is_active ? 'true' : 'false');
        });
    }

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Menu::class, 'parent_id')->orderBy('order');
    }

    public function roles()
    {
        return $this->belongsToMany(\Spatie\Permission\Models\Role::class, 'menu_role');
    }

    public function scopeActive($query)
    {
        return $query->whereRaw('is_active IS TRUE');
    }

    /**
     * Activity log options for this model.
     */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'url', 'icon', 'order', 'is_active'])
            ->logOnlyDirty()
            ->setDescriptionForEvent(fn(string $eventName) => "Menu {$eventName}");
    }
}
