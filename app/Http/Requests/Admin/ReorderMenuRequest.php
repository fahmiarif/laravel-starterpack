<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ReorderMenuRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'orders' => 'required|array',
            'orders.*.id' => 'required|uuid|exists:menus,id',
            'orders.*.order' => 'required|integer|min:0',
            'orders.*.parent_id' => 'nullable|uuid|exists:menus,id',
        ];
    }

    public function messages(): array
    {
        return [
            'orders.required' => 'Data urutan menu wajib diisi.',
            'orders.array' => 'Format data urutan menu tidak valid.',
            'orders.*.id.required' => 'ID menu wajib diisi.',
            'orders.*.id.uuid' => 'Format ID menu harus UUID.',
            'orders.*.id.exists' => 'Menu tidak ditemukan.',
            'orders.*.order.required' => 'Urutan menu wajib diisi.',
            'orders.*.order.integer' => 'Urutan menu harus berupa angka.',
            'orders.*.parent_id.uuid' => 'Format ID parent harus UUID.',
            'orders.*.parent_id.exists' => 'Parent menu tidak ditemukan.',
        ];
    }
}
