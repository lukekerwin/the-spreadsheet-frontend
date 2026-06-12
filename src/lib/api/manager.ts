/**
 * Manager Tools API endpoints
 * Requires Manager Tools subscription
 */

import { apiCall } from './client';
import type { ContractValuesResponse, ContractValuesFilters } from '@/types/api';

/**
 * Fetch contract value data with filtering and pagination
 *
 * @param filters - Filter and pagination options
 * @returns Paginated contract value data
 */
export async function fetchContractValues(filters: ContractValuesFilters): Promise<ContractValuesResponse> {
    return apiCall<ContractValuesResponse>(
        '/api/v1/manager/contract-values',
        'GET',
        undefined,
        { ...filters }
    );
}
