import fs from 'fs/promises';
import path from 'path';
import handlebars from 'handlebars';

export class TemplateEngine {
  private cache = new Map<string, HandlebarsTemplateDelegate>();

  constructor(private templatesDir: string) {}

  async render<T>(templateName: string, data: T): Promise<string> {
    let template = this.cache.get(templateName);
    
    if (!template) {
      const templatePath = path.join(this.templatesDir, `${templateName}.hbs`);
      
      try {
        const templateContent = await fs.readFile(templatePath, 'utf-8');
        template = handlebars.compile(templateContent);
        this.cache.set(templateName, template);
      } catch (error) {
        throw new Error(`Template not found: ${templatePath}`);
      }
    }

    return template(data);
  }

  async initialize(): Promise<void> {
    try {
      // Register layout partials
      const layoutPath = path.join(this.templatesDir, 'layouts', 'main.hbs');
      const layoutContent = await fs.readFile(layoutPath, 'utf-8');
      handlebars.registerPartial('layout', layoutContent);

      // Custom helpers
      handlebars.registerHelper('formatDate', (date: Date) => {
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      });

      handlebars.registerHelper('currency', (amount: number) => {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amount);
      });

      handlebars.registerHelper('eq', (a, b) => a === b);
      handlebars.registerHelper('gt', (a, b) => a > b);
      handlebars.registerHelper('lt', (a, b) => a < b);

      console.log('✅ Template engine initialized');
    } catch (error) {
      console.warn('⚠️  Could not initialize template layouts:', error);
    }
  }

  clearCache(): void {
    this.cache.clear();
  }
}
