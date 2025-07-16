import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const FilterPackageTourSchema = z.object({
  origin: z.string().optional(),
  destination: z.string().optional(),
  transportType: z.enum(['buggy', 'lancha', '4x4']).optional(),
});

export class FilterPackageTourDto extends createZodDto(FilterPackageTourSchema) {}