'use client';
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { leadServicios, LeadServicio } from "@/lib/types";

export const serviceDisplayNames: Record<LeadServicio, string> = {
    'desarrollo-web': 'Desarrollo Web',
    'marketing-digital': 'Marketing Digital',
    'gestion-redes': 'Gestión de Redes',
    'consultoria-negocios': 'Consultoría de Negocios',
    'diseno-grafico': 'Diseño Gráfico',
    'otro': 'Otro'
};

interface ServiciosCheckboxesProps {
    field: {
        value: LeadServicio[];
        onChange: (value: LeadServicio[]) => void;
    };
}

export function ServiciosCheckboxes({ field }: ServiciosCheckboxesProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {leadServicios.map((item) => (
                <FormItem
                    key={item}
                    className="flex flex-row items-start space-x-3 space-y-0"
                >
                    <FormControl>
                        <Checkbox
                            checked={field.value?.includes(item)}
                            onCheckedChange={(checked) => {
                                const currentServices = field.value || [];
                                return checked
                                    ? field.onChange([...currentServices, item])
                                    : field.onChange(
                                        currentServices?.filter(
                                            (value) => value !== item
                                        )
                                    );
                            }}
                        />
                    </FormControl>
                    <FormLabel className="font-normal text-sm">
                        {serviceDisplayNames[item]}
                    </FormLabel>
                </FormItem>
            ))}
        </div>
    );
}
