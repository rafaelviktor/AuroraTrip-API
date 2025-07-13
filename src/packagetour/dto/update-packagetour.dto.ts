import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UpdatePackageTourSchema = z.object({
  vehicle: z.string().nonempty().optional(),
  origin: z.string().nonempty().optional(),
  destination: z.string().nonempty().optional(),
  departureTime: z.coerce.date().optional(),
  returnTime: z.coerce.date().optional(),
  price: z.number().positive().optional(),
  seatsAvailable: z.number().int().nonnegative().optional(),
  tourType: z.enum([
    'aventura', 'histórico', 'cultural', 'ecológico', 'gastronômico', 'outro'
  ]).optional(),
});

export class UpdatePackageTourDto extends createZodDto(UpdatePackageTourSchema) {}