import { AlertTriangle } from "lucide-react";
import { referenceStates } from "./data";
import Alert from "../../../Components/UI/Alert";
import Badge from "../../../Components/UI/Badge";

const ReferenceStates = () => {
    return (
        <div className="space-y-3">
            <h3 className="m-0 text-xs font-bold uppercase tracking-wider text-(--theme-text-muted)">
                States Reference
            </h3>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {referenceStates.map((state) => (
                    <Alert
                        key={state.id}
                        variant={state.variant}
                        leftIcon={<AlertTriangle size={16} />}
                        rounded="rounded-xl"
                    >
                        <div className="flex flex-col gap-2">
                            <div>
                                <Badge variant={state.variant} size="sm">
                                    {state.label}
                                </Badge>
                            </div>
                            <span className="text-xs font-medium opacity-80">{state.description}</span>
                        </div>
                    </Alert>
                ))}
            </div>
        </div>
    );
};

export default ReferenceStates;
