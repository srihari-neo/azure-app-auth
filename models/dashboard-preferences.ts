import mongoose, { Schema, Document, Types, Model } from 'mongoose';

// Interface for individual widget configuration
export interface IWidget {
  id: string;
  type: string; // e.g., 'chart', 'table', 'card', 'calendar'
  x: number; // Grid position X
  y: number; // Grid position Y
  w: number; // Width in grid units
  h: number; // Height in grid units
  minW?: number; // Minimum width
  minH?: number; // Minimum height
  maxW?: number; // Maximum width
  maxH?: number; // Maximum height
  isResizable?: boolean;
  isDraggable?: boolean;
  title?: string;
  config?: Record<string, unknown>; // Widget-specific configuration
}

// Interface for dashboard layout
export interface IDashboardLayout {
  name: string;
  isDefault?: boolean;
  widgets: IWidget[];
  gridCols: number; // Number of columns in grid
  gridRowHeight: number; // Height of each row in pixels
  margin?: [number, number]; // [horizontal, vertical] margins
  containerPadding?: [number, number]; // [horizontal, vertical] padding
  breakpoints?: Record<string, number>; // Responsive breakpoints
  cols?: Record<string, number>; // Columns for different breakpoints
}

// Main interface for dashboard preferences document
export interface IDashboardPreferences extends Document {
  userId: Types.ObjectId;
  layouts: IDashboardLayout[];
  activeLayoutName: string;
  globalSettings: {
    theme?: 'light' | 'dark' | 'auto';
    autoSave?: boolean;
    refreshInterval?: number; // in seconds
    compactMode?: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  addLayout(layout: IDashboardLayout): Promise<IDashboardPreferences>;
  updateLayout(layoutName: string, updates: Partial<IDashboardLayout>): Promise<IDashboardPreferences>;
  deleteLayout(layoutName: string): Promise<IDashboardPreferences>;
}

// Interface for static methods
export interface IDashboardPreferencesModel extends Model<IDashboardPreferences> {
  createDefaultPreferences(userId: Types.ObjectId): Promise<IDashboardPreferences>;
}

// Widget schema
const WidgetSchema = new Schema<IWidget>({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['chart', 'table', 'card', 'calendar', 'graph', 'metric', 'text', 'image', 'custom']
  },
  x: {
    type: Number,
    required: true,
    min: 0
  },
  y: {
    type: Number,
    required: true,
    min: 0
  },
  w: {
    type: Number,
    required: true,
    min: 1
  },
  h: {
    type: Number,
    required: true,
    min: 1
  },
  minW: {
    type: Number,
    default: 1,
    min: 1
  },
  minH: {
    type: Number,
    default: 1,
    min: 1
  },
  maxW: {
    type: Number,
    default: 12
  },
  maxH: {
    type: Number,
    default: 12
  },
  isResizable: {
    type: Boolean,
    default: true
  },
  isDraggable: {
    type: Boolean,
    default: true
  },
  title: {
    type: String,
    trim: true
  },
  config: {
    type: Schema.Types.Mixed,
    default: {}
  }
}, { _id: false });

// Dashboard layout schema
const DashboardLayoutSchema = new Schema<IDashboardLayout>({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  widgets: [WidgetSchema],
  gridCols: {
    type: Number,
    required: true,
    default: 12,
    min: 1,
    max: 24
  },
  gridRowHeight: {
    type: Number,
    required: true,
    default: 150,
    min: 50
  },
  margin: {
    type: [Number],
    default: [10, 10],
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && v.every(num => num >= 0);
      },
      message: 'Margin must be an array of two non-negative numbers'
    }
  },
  containerPadding: {
    type: [Number],
    default: [10, 10],
    validate: {
      validator: function(v: number[]) {
        return v.length === 2 && v.every(num => num >= 0);
      },
      message: 'Container padding must be an array of two non-negative numbers'
    }
  },
  breakpoints: {
    type: Schema.Types.Mixed,
    default: {
      lg: 1200,
      md: 996,
      sm: 768,
      xs: 480,
      xxs: 0
    }
  },
  cols: {
    type: Schema.Types.Mixed,
    default: {
      lg: 12,
      md: 10,
      sm: 6,
      xs: 4,
      xxs: 2
    }
  }
}, { _id: false });

// Main dashboard preferences schema
const DashboardPreferencesSchema = new Schema<IDashboardPreferences>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  layouts: {
    type: [DashboardLayoutSchema],
    required: true,
    validate: {
      validator: function(layouts: IDashboardLayout[]) {
        return layouts.length > 0;
      },
      message: 'At least one layout is required'
    }
  },
  activeLayoutName: {
    type: String,
    required: true,
    validate: {
      validator: function(this: IDashboardPreferences, layoutName: string) {
        return this.layouts.some(layout => layout.name === layoutName);
      },
      message: 'Active layout name must match one of the existing layouts'
    }
  },
  globalSettings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    autoSave: {
      type: Boolean,
      default: true
    },
    refreshInterval: {
      type: Number,
      default: 300, // 5 minutes
      min: 30,
      max: 3600
    },
    compactMode: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes for better performance
DashboardPreferencesSchema.index({ userId: 1 });
DashboardPreferencesSchema.index({ 'layouts.name': 1 });

// Pre-save middleware to ensure only one default layout
DashboardPreferencesSchema.pre('save', function(next) {
  const defaultLayouts = this.layouts.filter(layout => layout.isDefault);
  if (defaultLayouts.length > 1) {
    // Keep only the first default layout
    this.layouts.forEach((layout, index) => {
      if (index > 0 && layout.isDefault) {
        layout.isDefault = false;
      }
    });
  }
  next();
});

// Instance methods
DashboardPreferencesSchema.methods.addLayout = function(layout: IDashboardLayout) {
  // Ensure layout name is unique
  const existingLayout = this.layouts.find((l: IDashboardLayout) => l.name === layout.name);
  if (existingLayout) {
    throw new Error(`Layout with name "${layout.name}" already exists`);
  }
  
  this.layouts.push(layout);
  return this.save();
};

DashboardPreferencesSchema.methods.updateLayout = function(layoutName: string, updates: Partial<IDashboardLayout>) {
  const layout = this.layouts.find((l: IDashboardLayout) => l.name === layoutName);
  if (!layout) {
    throw new Error(`Layout with name "${layoutName}" not found`);
  }
  
  Object.assign(layout, updates);
  return this.save();
};

DashboardPreferencesSchema.methods.deleteLayout = function(layoutName: string) {
  if (this.layouts.length <= 1) {
    throw new Error('Cannot delete the last layout');
  }
  
  const layoutIndex = this.layouts.findIndex((l: IDashboardLayout) => l.name === layoutName);
  if (layoutIndex === -1) {
    throw new Error(`Layout with name "${layoutName}" not found`);
  }
  
  this.layouts.splice(layoutIndex, 1);
  
  // If deleted layout was active, switch to first available layout
  if (this.activeLayoutName === layoutName) {
    this.activeLayoutName = this.layouts[0].name;
  }
  
  return this.save();
};

// Static method - Fixed typing issue
DashboardPreferencesSchema.statics.createDefaultPreferences = async function(
  userId: Types.ObjectId
): Promise<IDashboardPreferences> {
  const defaultLayout: IDashboardLayout = {
    name: 'Default',
    isDefault: true,
    widgets: [
      {
        id: 'welcome-widget',
        type: 'card',
        x: 0,
        y: 0,
        w: 6,
        h: 2,
        title: 'Welcome',
        config: {
          message: 'Welcome to your dashboard!'
        }
      },
      {
        id: 'stats-widget',
        type: 'metric',
        x: 6,
        y: 0,
        w: 6,
        h: 2,
        title: 'Quick Stats',
        config: {}
      }
    ],
    gridCols: 12,
    gridRowHeight: 150
  };

  return this.create({
    userId,
    layouts: [defaultLayout],
    activeLayoutName: 'Default',
    globalSettings: {
      theme: 'light',
      autoSave: true,
      refreshInterval: 300,
      compactMode: false
    }
  });
};

// Create and export the model with proper typing
const DashboardPreferencesModel = mongoose.models.DashboardPreferences as IDashboardPreferencesModel || 
  mongoose.model<IDashboardPreferences, IDashboardPreferencesModel>('DashboardPreferences', DashboardPreferencesSchema);

export default DashboardPreferencesModel;