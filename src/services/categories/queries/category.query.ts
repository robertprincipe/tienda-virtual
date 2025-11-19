import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import {
  getCategories,
  getCategoriesInfinite,
  getCategory,
} from "../actions/category.actions";

export const useCategories = (filters?: {
  notInIds?: number[];
  onlyParents?: boolean;
}) =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async () => await getCategories(filters),
  });

export const useCategory = (id: number) =>
  useQuery({
    queryKey: ["category", id],
    queryFn: async () => await getCategory(id),
  });

export const useCategoriesInfinity = (searchTerm: string) => {
  return useInfiniteQuery({
    // Unique key for caching and identifying this query
    // It includes the searchTerm to create separate caches for different searches
    queryKey: ["infinite-category-list", searchTerm],

    // The function that fetches the data for each page
    // pageParam is provided by react-query and represents the cursor for pagination
    queryFn: ({ pageParam }) =>
      getCategoriesInfinite({
        page: pageParam,
        per_page: 2,
        search: searchTerm,
      }),
    // fetchCategories(pageParam as string | null, searchTerm),

    // The initial value for pageParam when the query is first run
    // null indicates that we're starting from the beginning of the list
    initialPageParam: 1,

    // Function to determine the next pageParam (cursor) based on the last fetched page
    // This is used by react-query to know how to fetch the next page
    getNextPageParam: (lastPage) => lastPage?.result.nextPage ?? undefined,
  });
};

// export const useSearchCategories = (query: string, enabled: boolean) =>
//   useQuery({
//     queryKey: ["categories", query],
//     queryFn: async () =>
//       await getCategories({
//         name: query,
//         page: 1,
//         per_page: 21,
//       }),
//     enabled,
//   });
