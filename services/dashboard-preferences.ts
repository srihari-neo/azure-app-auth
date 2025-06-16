
import connectToDatabase from '@/lib/mongoose';
import DashboardPreferences, { IDashboardLayout, IDashboardPreferences, IWidget } from '@/models/dashboard-preferences';
import { Types } from 'mongoose';

export class DashboardService {
  private static async ensureConnection() {
    await connectToDatabase();
  }

  static async getUserPreferences(userId: string): Promise<IDashboardPreferences | null> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    let preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      const defaultPrefs = DashboardPreferences.createDefaultPreferences(objectId);
      preferences = await DashboardPreferences.create(defaultPrefs);
    }
    
    return preferences;
  }

  static async updateWidgetLayout(
    userId: string, 
    layoutName: string, 
    widgets: IWidget[]
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const layout = preferences.layouts.find(l => l.name === layoutName);
    if (!layout) {
      throw new Error(`Layout "${layoutName}" not found`);
    }

    layout.widgets = widgets;
    await preferences.save();
    
    return preferences;
  }

  static async addWidget(
    userId: string,
    layoutName: string,
    widget: IWidget
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const layout = preferences.layouts.find(l => l.name === layoutName);
    if (!layout) {
      throw new Error(`Layout "${layoutName}" not found`);
    }

    const existingWidget = layout.widgets.find(w => w.id === widget.id);
    if (existingWidget) {
      throw new Error(`Widget with ID "${widget.id}" already exists`);
    }

    layout.widgets.push(widget);
    await preferences.save();
    
    return preferences;
  }

  static async removeWidget(
    userId: string,
    layoutName: string,
    widgetId: string
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const layout = preferences.layouts.find(l => l.name === layoutName);
    if (!layout) {
      throw new Error(`Layout "${layoutName}" not found`);
    }

    const widgetIndex = layout.widgets.findIndex(w => w.id === widgetId);
    if (widgetIndex === -1) {
      throw new Error(`Widget with ID "${widgetId}" not found`);
    }

    layout.widgets.splice(widgetIndex, 1);
    await preferences.save();
    
    return preferences;
  }

  static async switchLayout(
    userId: string,
    layoutName: string
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const layout = preferences.layouts.find(l => l.name === layoutName);
    if (!layout) {
      throw new Error(`Layout "${layoutName}" not found`);
    }

    preferences.activeLayoutName = layoutName;
    await preferences.save();
    
    return preferences;
  }

  static async createLayout(
    userId: string,
    layout: IDashboardLayout
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    await preferences.addLayout(layout);
    return preferences;
  }

  static async updateGlobalSettings(
    userId: string,
    settings: Partial<IDashboardPreferences['globalSettings']>
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    preferences.globalSettings = { ...preferences.globalSettings, ...settings };
    await preferences.save();
    
    return preferences;
  }

  static async getActiveLayout(userId: string): Promise<IDashboardLayout | null> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      return null;
    }

    return preferences.layouts.find(l => l.name === preferences.activeLayoutName) || null;
  }

  static async duplicateLayout(
    userId: string,
    sourceLayoutName: string,
    newLayoutName: string
  ): Promise<IDashboardPreferences> {
    await this.ensureConnection();
    
    const objectId = new Types.ObjectId(userId);
    const preferences = await DashboardPreferences.findOne({ userId: objectId });
    
    if (!preferences) {
      throw new Error('User preferences not found');
    }

    const sourceLayout = preferences.layouts.find(l => l.name === sourceLayoutName);
    if (!sourceLayout) {
      throw new Error(`Source layout "${sourceLayoutName}" not found`);
    }

    const newLayout: IDashboardLayout = {
      ...JSON.parse(JSON.stringify(sourceLayout)),
      name: newLayoutName,
      isDefault: false
    };

    await preferences.addLayout(newLayout);
    return preferences;
  }
}