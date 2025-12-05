import { employeesService } from "./employees.service";

export class EmployeesController {
	async getAllEmployees(options?: {
		storeId?: string;
		role?: string;
		includeInactive?: boolean;
	}) {
		return await employeesService.getAllEmployees(options);
	}

	async getEmployeeById(id: string) {
		return await employeesService.getEmployeeById(id);
	}

	async getEmployeeSales(
		employeeId: string,
		options?: {
			startDate?: Date;
			endDate?: Date;
		},
	) {
		return await employeesService.getEmployeeSales(employeeId, options);
	}

	async getEmployeeStats(employeeId: string) {
		return await employeesService.getEmployeeStats(employeeId);
	}
}

export const employeesController = new EmployeesController();
