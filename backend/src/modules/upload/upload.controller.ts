import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join, extname } from "path";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../../common/decorators/roles.decorator";

@Controller("upload")
export class UploadController {
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @UseInterceptors(FileInterceptor("file", {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    }
  }))
  async uploadFile(@UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException("Nenhum arquivo enviado!");
    }

    if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
      throw new BadRequestException("Apenas imagens são permitidas!");
    }

    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extname(file.originalname)}`;
    
    // Tenta salvar no disco local
    try {
      const uploadDir = join(process.cwd(), "uploads");
      if (!existsSync(uploadDir)) {
        mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = join(uploadDir, filename);
      writeFileSync(filePath, file.buffer);
      
      // Retorna a URL relativa
      return {
        url: `/backend/uploads/${filename}`,
      };
    } catch (error) {
      console.warn("Failed to write to disk, falling back to base64 encoding", error);
      // Fallback: retorna como Base64 data URL
      const base64Data = file.buffer.toString("base64");
      return {
        url: `data:${file.mimetype};base64,${base64Data}`,
      };
    }
  }
}
