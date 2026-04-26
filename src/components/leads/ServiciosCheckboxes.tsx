'use client';
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { leadServicios, LeadServicio } from "@/lib/types";

export const serviceDisplayNames: Record<LeadServicio, string> = {
    'landing-page': 'Landing Page',
    'crm': 'CRM',
    'menu-digital': 'Menú Digital',
    'catalogo-digital': 'Catálogo Digital',
    'panel-administrativo': 'Panel Administrativo',
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
