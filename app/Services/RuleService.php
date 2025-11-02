<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\AutoReplyRule;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * RuleService
 *
 * Service layer for auto-reply rule management.
 * Handles all business logic for creating, updating, filtering, and managing
 * automated response rules for chat threads.
 *
 * This service follows a thick-service, thin-controller pattern where all
 * business logic is delegated here from controllers.
 *
 * @author Development Team
 *
 * @version 1.0
 */
class RuleService
{
    /**
     * Get paginated list of auto-reply rules with optional filtering.
     *
     * Supports filtering by chat, active status, and keyword search.
     * Returns paginated results with eager-loaded relationships.
     *
     * @param array{
     *     page?: int,
     *     per_page?: int,
     *     chat_id?: int|null,
     *     is_active?: bool|null,
     *     search?: string|null,
     *     sort_by?: string,
     *     sort_order?: string
     * } $filters Filter parameters for query
     * @return LengthAwarePaginator Paginated rule results
     */
    public function getRules(array $filters = []): LengthAwarePaginator
    {
        $query = $this->buildRuleQuery($filters);
        $perPage = $filters['per_page'] ?? 15;

        return $query->paginate($perPage);
    }

    /**
     * Get all active auto-reply rules (non-paginated).
     *
     * Used when retrieving all active rules for quick lookup during message processing.
     *
     * @param  int|null  $chatId  Optional chat ID to filter rules for specific chat
     * @return Collection Collection of active rules
     */
    public function getActiveRules(?int $chatId = null): Collection
    {
        $query = AutoReplyRule::where('is_active', true);

        if ($chatId !== null) {
            $query->where('chat_id', $chatId);
        }

        return $query->with('creator')->get();
    }

    /**
     * Retrieve a single rule by ID with all relationships.
     *
     * @param  int  $id  Rule ID
     * @return AutoReplyRule The rule instance with relationships loaded
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found
     */
    public function getRuleById(int $id): AutoReplyRule
    {
        return AutoReplyRule::with(['chat', 'creator'])
            ->findOrFail($id);
    }

    /**
     * Create a new auto-reply rule.
     *
     * @param  array{chat_id?: int|null, keyword: string, reply_message: string, is_active?: bool}  $data  Rule data
     * @return AutoReplyRule Created rule instance
     */
    public function createRule(array $data): AutoReplyRule
    {
        // Set defaults
        $data['is_active'] = $data['is_active'] ?? true;
        $data['created_by'] = auth()->id();

        return AutoReplyRule::create($data);
    }

    /**
     * Update an existing auto-reply rule.
     *
     * @param  int  $id  Rule ID to update
     * @param  array{keyword?: string, reply_message?: string, is_active?: bool}  $data  Update data
     * @return AutoReplyRule Updated rule instance
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found
     */
    public function updateRule(int $id, array $data): AutoReplyRule
    {
        $rule = AutoReplyRule::findOrFail($id);
        $data['updated_by'] = auth()->id();

        $rule->update($data);

        return $rule;
    }

    /**
     * Delete an auto-reply rule.
     *
     * @param  int  $id  Rule ID to delete
     * @return bool True if deletion succeeded
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found
     */
    public function deleteRule(int $id): bool
    {
        $rule = AutoReplyRule::findOrFail($id);

        return $rule->delete();
    }

    /**
     * Activate an auto-reply rule.
     *
     * @param  int  $id  Rule ID to activate
     * @return AutoReplyRule Updated rule instance
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found
     */
    public function activateRule(int $id): AutoReplyRule
    {
        return $this->updateRule($id, ['is_active' => true]);
    }

    /**
     * Deactivate an auto-reply rule.
     *
     * @param  int  $id  Rule ID to deactivate
     * @return AutoReplyRule Updated rule instance
     *
     * @throws \Illuminate\Database\Eloquent\ModelNotFoundException If rule not found
     */
    public function deactivateRule(int $id): AutoReplyRule
    {
        return $this->updateRule($id, ['is_active' => false]);
    }

    /**
     * Find a matching auto-reply rule for a keyword.
     *
     * Used when processing incoming messages to find applicable auto-reply rules.
     * Case-insensitive keyword matching.
     *
     * @param  string  $keyword  Keyword to search for
     * @return AutoReplyRule|null The first matching active rule or null
     */
    public function findRuleByKeyword(string $keyword): ?AutoReplyRule
    {
        return AutoReplyRule::where('is_active', true)
            ->where('keyword', 'like', '%'.strtolower($keyword).'%')
            ->first();
    }

    /**
     * Build a query for auto-reply rules with optional filtering and relationships.
     *
     * Private method used internally to construct filtered queries.
     * Supports filtering, sorting, and eager loading.
     *
     * @param array{
     *     chat_id?: int|null,
     *     is_active?: bool|null,
     *     search?: string|null,
     *     sort_by?: string,
     *     sort_order?: string
     * } $filters Filter parameters
     * @return Builder Query builder instance
     */
    private function buildRuleQuery(array $filters): Builder
    {
        $query = AutoReplyRule::with(['chat', 'creator']);

        // Filter by chat
        if (isset($filters['chat_id'])) {
            $chatId = $filters['chat_id'];
            if ($chatId === 'global') {
                $query->whereNull('chat_id');
            } else {
                $query->where('chat_id', $chatId);
            }
        }

        // Filter by active status
        if (isset($filters['is_active'])) {
            $query->where('is_active', (bool) $filters['is_active']);
        }

        // Search by keyword or reply message
        if (! empty($filters['search'])) {
            $searchTerm = '%'.$filters['search'].'%';
            $query->where(function ($q) use ($searchTerm): void {
                $q->where('keyword', 'like', $searchTerm)
                    ->orWhere('reply_message', 'like', $searchTerm);
            });
        }

        // Sorting
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortOrder = $filters['sort_order'] ?? 'desc';
        $query->orderBy($sortBy, $sortOrder);

        return $query;
    }
}
