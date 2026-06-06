<?php

namespace App\Models;

use Database\Factories\ShopFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Shop extends Model
{
    /** @use HasFactory<ShopFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'slug',
        'description',
        'city',
        'status',
        'approved_at',
    ];

    protected $appends = [
        'cover_image',
        'logo_image',
        'member_since',
    ];

    protected function casts(): array
    {
        return [
            'approved_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function getCoverImageAttribute(): string
    {
        return match ($this->slug) {
            'studio-safi' => 'https://images.unsplash.com/photo-1493106819501-66d381c466f1?auto=format&fit=crop&w=1600&q=80',
            'maison-taznakht' => 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=1600&q=80',
            'dar-cuivre' => 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1600&q=80',
            default => 'https://images.unsplash.com/photo-1503387837-b154d5074bd2?auto=format&fit=crop&w=1600&q=80',
        };
    }

    public function getLogoImageAttribute(): string
    {
        return match ($this->slug) {
            'studio-safi' => 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=500&q=80',
            'maison-taznakht' => 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?auto=format&fit=crop&w=500&q=80',
            'dar-cuivre' => 'https://images.unsplash.com/photo-1612222869049-d8ec83637a3c?auto=format&fit=crop&w=500&q=80',
            default => 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=500&q=80',
        };
    }

    public function getMemberSinceAttribute(): ?string
    {
        return $this->approved_at instanceof Carbon
            ? $this->approved_at->translatedFormat('F Y')
            : null;
    }
}
