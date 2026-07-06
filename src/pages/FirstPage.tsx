import { useBankAccountFacade } from "@/hooks/useBankAccountFacade";

export function FirstPage(){
     const { status, personalDetails, transactions, results, error, reload } = useBankAccountFacade();
     console.log(status, personalDetails, transactions, results, error, reload);
    return(<div>First page</div>)
}