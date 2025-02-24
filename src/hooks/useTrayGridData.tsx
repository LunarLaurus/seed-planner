// hooks/useTrayGridData.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchTrayGrid, fetchPlants, assignPlantToCell, resetTrayCell } from "@/utils/api";
import { Tray, TrayCell, Plant, Cell, CellCoordinates } from "@/typings/types";

export const useTrayGridData = (trayId: number, isVisible: boolean) => {
  const queryClient = useQueryClient();

  const trayQuery = useQuery<{ tray: Tray; grid: TrayCell[] }>({
    queryKey: ["trayGrid", trayId],
    queryFn: () => fetchTrayGrid(trayId),
    enabled: !!trayId && isVisible,
  });

  const plantsQuery = useQuery<Plant[]>({
    queryKey: ["plants"],
    queryFn: fetchPlants,
  });

  const assignPlantMutation = useMutation({
    mutationFn: (cell: Cell) => assignPlantToCell(trayId, cell),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trayGrid", trayId] }),
  });

  const resetCellMutation = useMutation({
    mutationFn: (coords: CellCoordinates) => resetTrayCell(trayId, coords),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["trayGrid", trayId] }),
  });

  return {
    trayData: trayQuery.data,
    isLoading: trayQuery.isLoading,
    isError: trayQuery.isError,
    plants: plantsQuery.data,
    assignPlantMutation,
    resetCellMutation,
  };
};
