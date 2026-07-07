// import { useMutation, useQueryClient } from "@tanstack/react-query";
import type React from "react";
import { Button } from "@/components/Button";
import type { LoadStatus } from "@/types/domain.types";

export interface ReloadButtonProps {
  status: LoadStatus;
  onReload: () => void;
}

export function ReloadButton({ status, onReload }: ReloadButtonProps): React.ReactElement {
  const isLoading = status === "loading";

  return (
    <Button
      variant="primary"
      isLoading={isLoading}
      loadingText="Loading account…"
      onClick={onReload}
    >
      {status === "idle" ? "Load account data" : "Reload"}
    </Button>
  );
}
// // ----------optimistc update tanstack

// function TodoItem({ todo }) {
//   const queryClient = useQueryClient();
//   const updateTodo = useMutation({
//     mutationFn: (updated)=>fetch(``, method: 'PATCH', body: JSON.stringify(updated)),
//     // the magic happens here
//     onMutate: async(newTodo)=>{
//       // cancel in-flght fetches
//       await queryClient.cancelQueries({queryKey: ['todos']})
//       // snapshot current state
//       const previousTodos = queryClient.getQueryData(['todos'])

//       // optimistically update cache
//       queryClient.setQueryData(['todos', old=> old.map((t)=> t.id === newTodo.id ?  {...t, ...newTodo}: t)]);

//       // return snapshot for rollback
//       return {previousTodos}
//     }
//     onError(error, newTodo context) {
//       // Rollback on failure
//       queryClient.setQueryData(['todos'], context?.previousTodos)

//     },
//     onSettled() {
//       //sync with server
//       queryClient.invalidateQueries({queryKey;['todos']})
//     },
// }
// )
// return(
//     <li>
//     <input type='checkbox'/>
//     {todo.title}
//     </li>
//   )

// }
